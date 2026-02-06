const Booking = {
  els: {},

  initQuickBooking() {
    this.els = {
      btn: document.getElementById("quickbook-btn"),
      duration: document.getElementById("quickbook-duration"),
    };

    this.els.btn.addEventListener("click", () => this.handleQuickBook());

    this.initBookingModal();

    console.log("QuickBooking initialized");
  },

  async handleQuickBook() {
    const duration = parseInt(this.els.duration.value);

    // Only allow booking when room is free
    const status = await API.fetchStatus();
    if (status && status.isOccupied) {
      this.showToast("Raum ist belegt — Buchung nicht möglich", "error");
      return;
    }

    // Loading state
    this.els.btn.disabled = true;
    this.els.btn.textContent = "Buche...";

    const result = await API.quickBook(duration);

    // Reset button
    this.els.btn.disabled = false;
    this.els.btn.textContent = "Jetzt buchen";

    if (result && result.success) {
      const label = this.formatDuration(duration);
      this.showToast(`Raum gebucht für ${label}`, "success");
      StatusDisplay.updateStatus();
    } else {
      this.showToast("Buchung fehlgeschlagen", "error");
    }
  },

  formatDuration(minutes) {
    if (minutes < 60) return `${minutes} Minuten`;
    const hours = minutes / 60;
    if (hours === 1) return "1 Stunde";
    return `${hours.toString().replace(".", ",")} Stunden`;
  },

  // --- Booking Modal ---

  initBookingModal() {
    this.els.modal = document.getElementById("booking-modal");
    this.els.modalOverlay = this.els.modal;
    this.els.modalContent = this.els.modal.querySelector(".modal-content");
    this.els.form = document.getElementById("booking-form");
    this.els.bookDate = document.getElementById("book-date");
    this.els.bookStart = document.getElementById("book-start");
    this.els.bookEnd = document.getElementById("book-end");
    this.els.bookTitle = document.getElementById("book-title");
    this.els.modalClose = document.getElementById("modal-close");
    this.els.modalCancel = document.getElementById("modal-cancel");

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
  },

  async submitBooking() {
    const date = this.els.bookDate.value;
    const startTime = this.els.bookStart.value;
    const endTime = this.els.bookEnd.value;
    const title = this.els.bookTitle.value;

    // Validation
    if (!date || !startTime || !endTime) {
      this.showToast("Bitte Datum, Start- und Endzeit ausfüllen", "error");
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    if (date < today) {
      this.showToast("Datum darf nicht in der Vergangenheit liegen", "error");
      return;
    }

    if (startTime >= endTime) {
      this.showToast("Startzeit muss vor Endzeit liegen", "error");
      return;
    }

    // Check minimum 15min duration
    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    const durationMin = eh * 60 + em - (sh * 60 + sm);
    if (durationMin < 15) {
      this.showToast("Mindestdauer: 15 Minuten", "error");
      return;
    }

    const submitBtn = this.els.form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "Reserviere...";

    const result = await API.createBooking(date, startTime, endTime, title);

    submitBtn.disabled = false;
    submitBtn.textContent = "Reservieren";

    if (result && result.success) {
      this.showToast("Termin erfolgreich reserviert", "success");
      this.closeBookingModal();
      StatusDisplay.updateStatus();
      Calendar.renderCalendar(Calendar.currentYear, Calendar.currentMonth);
    } else {
      this.showToast("Reservierung fehlgeschlagen", "error");
    }
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
