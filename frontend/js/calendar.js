const Calendar = {
  currentYear: new Date().getFullYear(),
  currentMonth: new Date().getMonth() + 1,
  selectedDate: null,
  events: [],
  els: {},

  MONTH_NAMES: [
    "Januar",
    "Februar",
    "März",
    "April",
    "Mai",
    "Juni",
    "Juli",
    "August",
    "September",
    "Oktober",
    "November",
    "Dezember",
  ],

  DAY_NAMES: [
    "Sonntag",
    "Montag",
    "Dienstag",
    "Mittwoch",
    "Donnerstag",
    "Freitag",
    "Samstag",
  ],

  initCalendar() {
    this.els = {
      title: document.getElementById("cal-title"),
      grid: document.getElementById("cal-grid"),
      prev: document.getElementById("cal-prev"),
      next: document.getElementById("cal-next"),
      container: document.getElementById("cal-container"),
      panel: document.getElementById("day-panel"),
      panelDate: document.getElementById("day-panel-date"),
      panelEvents: document.getElementById("day-panel-events"),
      panelClose: document.getElementById("day-panel-close"),
      panelBook: document.getElementById("day-panel-book"),
    };

    this.els.prev.addEventListener("click", () => this.prevMonth());
    this.els.next.addEventListener("click", () => this.nextMonth());
    this.els.panelClose.addEventListener("click", () => this.closePanel());
    this.els.panelBook.addEventListener("click", () => {
      if (this.selectedDate) Booking.openBookingModal(this.selectedDate);
    });

    this.renderCalendar(this.currentYear, this.currentMonth);

    setInterval(
      () => {
        this.renderCalendar(this.currentYear, this.currentMonth);
        if (this.selectedDate) this.renderPanel(this.selectedDate);
      },
      5 * 60 * 1000,
    );

    console.log("Calendar initialized (5min refresh)");
  },

  prevMonth() {
    this.currentMonth--;
    if (this.currentMonth < 1) {
      this.currentMonth = 12;
      this.currentYear--;
    }
    this.closePanel();
    this.renderCalendar(this.currentYear, this.currentMonth);
  },

  nextMonth() {
    this.currentMonth++;
    if (this.currentMonth > 12) {
      this.currentMonth = 1;
      this.currentYear++;
    }
    this.closePanel();
    this.renderCalendar(this.currentYear, this.currentMonth);
  },

  formatTime(dateStr) {
    return new Date(dateStr).toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  },

  async renderCalendar(year, month) {
    this.els.title.textContent = `${this.MONTH_NAMES[month - 1]} ${year}`;

    const data = await API.fetchEvents(year, month);
    this.events = data ? data.events : [];

    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDayRaw = new Date(year, month - 1, 1).getDay();
    const offset = (firstDayRaw + 6) % 7;

    const today = new Date();
    const isCurrentMonth =
      today.getFullYear() === year && today.getMonth() + 1 === month;

    let html = "";

    for (let i = 0; i < offset; i++) {
      html += '<div class="cal-day cal-day-empty"></div>';
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const isToday = isCurrentMonth && today.getDate() === day;
      const isSelected = this.selectedDate === dateStr;
      const dayEvents = this.getEventsForDay(dateStr);

      let classes = "cal-day cal-day-active";
      if (isToday) classes += " cal-day-today";
      if (isSelected) classes += " cal-day-selected";

      html += `<div class="${classes}" data-date="${dateStr}">`;
      html += `<span class="cal-day-number">${day}</span>`;

      if (dayEvents.length > 0) {
        html += '<div class="cal-day-events">';
        for (const event of dayEvents) {
          const time = this.formatTime(
            event.start.dateTime || event.start.date,
          );
          const title = event.summary || "Kein Titel";
          html += `<div class="cal-event-dot-line" title="${time} ${title}">`;
          html += `<span class="cal-event-dot"></span>`;
          html += `<span class="cal-event-label"><span class="cal-event-time">${time}</span> ${title}</span>`;
          html += "</div>";
        }
        html += "</div>";
      }

      html += "</div>";
    }

    const totalCells = offset + daysInMonth;
    const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let i = 0; i < remaining; i++) {
      html += '<div class="cal-day cal-day-empty"></div>';
    }

    this.els.grid.innerHTML = html;

    this.els.grid.querySelectorAll(".cal-day-active").forEach((el) => {
      el.addEventListener("click", () => this.openPanel(el.dataset.date));
    });
  },

  getEventsForDay(dateStr) {
    return this.events.filter((event) => {
      const start = event.start.dateTime || event.start.date;
      return start.startsWith(dateStr);
    });
  },

  openPanel(dateStr) {
    this.selectedDate = dateStr;
    this.els.container.classList.add("cal-shrunk");
    this.els.panel.classList.remove("hidden");
    this.renderPanel(dateStr);
    // Re-render to show selected state
    this.renderCalendar(this.currentYear, this.currentMonth);
  },

  closePanel() {
    this.selectedDate = null;
    this.els.container.classList.remove("cal-shrunk");
    this.els.panel.classList.add("hidden");
    // Re-render to remove selected state
    this.renderCalendar(this.currentYear, this.currentMonth);
  },

  renderPanel(dateStr) {
    const date = new Date(dateStr + "T00:00:00");
    const dayName = this.DAY_NAMES[date.getDay()];
    const day = date.getDate();
    const monthName = this.MONTH_NAMES[date.getMonth()];

    this.els.panelDate.textContent = `${dayName}, ${day}. ${monthName}`;

    const dayEvents = this.getEventsForDay(dateStr);

    if (dayEvents.length === 0) {
      this.els.panelEvents.innerHTML =
        '<p class="text-gray-500 text-lg text-center py-8">Keine Termine</p>';
      return;
    }

    let html = "";
    const deleteIcon =
      '<svg class="icon-trash" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v9h-2V9zm4 0h2v9h-2V9zM7 7h10l-1 14H8L7 7z"/></svg>';
    for (const event of dayEvents) {
      const title = event.summary || "Kein Titel";
      const start = this.formatTime(event.start.dateTime || event.start.date);
      const end = this.formatTime(event.end.dateTime || event.end.date);

      html += '<div class="day-panel-event">';
      html += '<div class="day-panel-event-info">';
      html += `<div class="day-panel-event-time">${start} — ${end}</div>`;
      html += `<div class="day-panel-event-title">${title}</div>`;
      html += "</div>";
      html += `<button class="day-panel-event-delete" data-event-id="${event.id}" aria-label="Löschen" title="Löschen">${deleteIcon}</button>`;
      html += "</div>";
    }

    this.els.panelEvents.innerHTML = html;

    this.els.panelEvents
      .querySelectorAll(".day-panel-event-delete")
      .forEach((btn) => {
        btn.addEventListener("click", () =>
          this.confirmDelete(btn.dataset.eventId),
        );
      });
  },

  confirmDelete(eventId) {
    const event = this.events.find((e) => e.id === eventId);
    const title = event ? event.summary || "Kein Titel" : "Termin";

    const overlay = document.getElementById("confirm-delete-modal");
    const titleEl = document.getElementById("confirm-delete-title");

    titleEl.textContent = `"${title}" wirklich löschen?`;
    overlay.classList.remove("hidden");

    const cleanup = () => {
      overlay.classList.add("hidden");
      document
        .getElementById("confirm-delete-btn")
        .replaceWith(
          document.getElementById("confirm-delete-btn").cloneNode(true),
        );
      document
        .getElementById("confirm-cancel-btn")
        .replaceWith(
          document.getElementById("confirm-cancel-btn").cloneNode(true),
        );
    };

    document
      .getElementById("confirm-delete-btn")
      .addEventListener("click", () => {
        cleanup();
        this.deleteEvent(eventId);
      });

    document
      .getElementById("confirm-cancel-btn")
      .addEventListener("click", () => {
        cleanup();
      });
  },

  async deleteEvent(eventId) {
    const result = await API.deleteEvent(eventId);
    if (result && result.success) {
      Booking.showToast("Termin gelöscht", "success");
      await this.renderCalendar(this.currentYear, this.currentMonth);
      if (this.selectedDate) this.renderPanel(this.selectedDate);
      StatusDisplay.updateStatus();
    } else {
      Booking.showToast("Löschen fehlgeschlagen", "error");
    }
  },
};

window.Calendar = Calendar;
