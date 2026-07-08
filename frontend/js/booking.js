const Booking = {
  els: {},

  initQuickBooking() {
    const quickForm = document.getElementById("quickbook-form");
    this.els = {
      btn: document.getElementById("quickbook-btn"),
      duration: document.getElementById("quickbook-duration"),
      title: document.getElementById("quickbook-title"),
    };

    quickForm.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleQuickBook();
    });

    this.initBookingModal();

    console.log("QuickBooking initialized");
  },

  async handleQuickBook() {
    const duration = parseInt(this.els.duration.value);
    const title = this.els.title.value.trim();

    if (StatusDisplay.isOccupied) {
      this.showToast(I18n.t("booking.roomOccupiedError"), "error");
      return;
    }

    const label = this.formatDuration(duration);
    const confirmed = await this.showBookingConfirm(
      I18n.t("booking.quickConfirm", { label }),
    );
    if (!confirmed) return;

    // Loading state
    this.els.btn.disabled = true;
    this.els.btn.textContent = I18n.t("quickbook.booking");

    const result = await API.quickBook(duration, title);

    // Reset button
    this.els.btn.disabled = false;
    this.els.btn.textContent = I18n.t("quickbook.bookNow");

    if (result && result.success) {
      this.showToast(I18n.t("booking.roomBookedSuccess", { label }), "success");
      this.els.title.value = "";
      await App.refreshAll();
    } else {
      this.showToast(I18n.t("booking.bookingFailed"), "error");
    }
  },

  formatDuration(minutes) {
    if (minutes < 60) return I18n.t("booking.durationMinutes", { count: minutes });
    const hours = minutes / 60;
    if (hours === 1) return I18n.t("booking.durationHourSingle");
    const count = I18n.current === "de" ? hours.toString().replace(".", ",") : hours.toString();
    return I18n.t("booking.durationHoursMulti", { count });
  },

  // --- Booking Modal ---

  initBookingModal() {
    this.els.modal = document.getElementById("booking-modal");
    this.els.form = document.getElementById("booking-form");
    this.els.bookDate = document.getElementById("book-date");
    this.els.bookStart = document.getElementById("book-start");
    this.els.bookEnd = document.getElementById("book-end");
    this.els.bookTitle = document.getElementById("book-title");
    this.els.bookRecurring = document.getElementById("book-recurring");
    this.els.bookFreq = document.getElementById("book-freq");
    this.els.bookUntil = document.getElementById("book-until");
    this.els.recurringOptions = document.getElementById("recurring-options");
    this.els.modalClose = document.getElementById("modal-close");
    this.els.modalCancel = document.getElementById("modal-cancel");

    this.els.bookRecurring.addEventListener("change", () => {
      this.els.recurringOptions.classList.toggle(
        "hidden",
        !this.els.bookRecurring.checked,
      );
    });

    this.els.form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.submitBooking();
    });
    this.els.modalClose.addEventListener("click", () =>
      this.closeBookingModal(),
    );
    this.els.modalCancel.addEventListener("click", () =>
      this.closeBookingModal(),
    );

    // Close on overlay click
    this.els.modal.addEventListener("click", (e) => {
      if (e.target === this.els.modal) this.closeBookingModal();
    });

    // Close on ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !this.els.modal.classList.contains("hidden")) {
        this.closeBookingModal();
      }
    });

    console.log("BookingModal initialized");
  },

  openBookingModal(preselectedDate) {
    const today = new Date().toISOString().split("T")[0];
    this.els.bookDate.min = today;

    if (preselectedDate) {
      this.els.bookDate.value = preselectedDate;
    } else {
      this.els.bookDate.value = today;
    }

    this.els.modal.classList.remove("hidden");
    this.els.bookStart.focus();
  },

  closeBookingModal() {
    this.els.modal.classList.add("hidden");
    this.els.form.reset();
    this.els.recurringOptions.classList.add("hidden");
  },

  async submitBooking() {
    const date = this.els.bookDate.value;
    const startTime = this.els.bookStart.value;
    const endTime = this.els.bookEnd.value;
    const title = this.els.bookTitle.value;

    // Validation
    if (!date || !startTime || !endTime || !title.trim()) {
      this.showToast(I18n.t("booking.fillRequiredFields"), "error");
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    if (date < today) {
      this.showToast(I18n.t("booking.dateInPast"), "error");
      return;
    }

    if (startTime >= endTime) {
      this.showToast(I18n.t("booking.startBeforeEnd"), "error");
      return;
    }

    // Check minimum 15min duration
    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    const durationMin = eh * 60 + em - (sh * 60 + sm);
    if (durationMin < 15) {
      this.showToast(I18n.t("booking.minDuration"), "error");
      return;
    }

    // Check for conflicts with existing events
    const bookingStart = new Date(`${date}T${startTime}`);
    const bookingEnd = new Date(`${date}T${endTime}`);
    const hasConflict = Calendar.events.some((event) => {
      const evStart = new Date(event.start.dateTime || event.start.date);
      const evEnd = new Date(event.end.dateTime || event.end.date);
      return bookingStart < evEnd && bookingEnd > evStart;
    });
    if (hasConflict) {
      this.showToast(I18n.t("booking.slotOccupied"), "error");
      return;
    }

    // Recurrence
    let recurrence = null;
    if (this.els.bookRecurring.checked) {
      const freq = this.els.bookFreq.value;
      const until = this.els.bookUntil.value;
      if (!until) {
        this.showToast(I18n.t("booking.recurrenceEndRequired"), "error");
        return;
      }
      if (until <= date) {
        this.showToast(I18n.t("booking.recurrenceEndAfterStart"), "error");
        return;
      }
      recurrence = [`RRULE:FREQ=${freq};UNTIL=${until.replace(/-/g, "")}T235959Z`];
    }

    const dateObj = new Date(date + "T00:00:00");
    const dayName = Calendar.DAY_NAMES[dateObj.getDay()];
    const day = dateObj.getDate();
    const monthName = Calendar.MONTH_NAMES[dateObj.getMonth()];

    let confirmMsg;
    if (recurrence) {
      const freqLabel = {
        DAILY: I18n.t("booking.freqDaily"),
        WEEKLY: I18n.t("booking.freqWeekly"),
        MONTHLY: I18n.t("booking.freqMonthly"),
      };
      const untilObj = new Date(this.els.bookUntil.value + "T00:00:00");
      const untilFormatted = `${untilObj.getDate()}. ${Calendar.MONTH_NAMES[untilObj.getMonth()]} ${untilObj.getFullYear()}`;
      confirmMsg = I18n.t("booking.confirmRecurring", {
        day: dayName,
        date: day,
        month: monthName,
        start: startTime,
        end: endTime,
        freq: freqLabel[this.els.bookFreq.value],
        untilDate: untilFormatted,
      });
    } else {
      confirmMsg = I18n.t("booking.confirmSingle", {
        day: dayName,
        date: day,
        month: monthName,
        start: startTime,
        end: endTime,
      });
    }

    const confirmed = await this.showBookingConfirm(confirmMsg);
    if (!confirmed) return;

    const submitBtn = this.els.form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = I18n.t("bookingModal.reserving");

    const result = await API.createBooking(date, startTime, endTime, title, recurrence);

    submitBtn.disabled = false;
    submitBtn.textContent = I18n.t("bookingModal.submit");

    if (result && result.success) {
      this.showToast(I18n.t("booking.reservedSuccess"), "success");
      this.closeBookingModal();
      await App.refreshAll();
    } else {
      this.showToast(I18n.t("booking.reservationFailed"), "error");
    }
  },

  showBookingConfirm(message) {
    return new Promise((resolve) => {
      const modal = document.getElementById("confirm-booking-modal");
      document.getElementById("confirm-booking-text").textContent = message;
      modal.classList.remove("hidden");

      const confirmBtn = document.getElementById("confirm-booking-btn");
      const cancelBtn = document.getElementById("confirm-booking-cancel");

      const cleanup = (result) => {
        modal.classList.add("hidden");
        resolve(result);
      };

      confirmBtn.addEventListener("click", () => cleanup(true), { once: true });
      cancelBtn.addEventListener("click", () => cleanup(false), { once: true });
      modal.addEventListener(
        "click",
        (e) => { if (e.target === modal) cleanup(false); },
        { once: true },
      );
    });
  },

  showToast(message, type) {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");

    const bg = type === "success" ? "bg-green-600" : "bg-red-600";
    toast.className = `toast ${bg} text-white px-6 py-3 rounded-lg shadow-lg text-base`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("toast-fade-out");
      toast.addEventListener("animationend", () => toast.remove());
    }, 3000);
  },
};

window.Booking = Booking;
