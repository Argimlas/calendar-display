const Calendar = {
  currentYear: new Date().getFullYear(),
  currentMonth: new Date().getMonth() + 1,
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

  initCalendar() {
    this.els = {
      title: document.getElementById("cal-title"),
      grid: document.getElementById("cal-grid"),
      prev: document.getElementById("cal-prev"),
      next: document.getElementById("cal-next"),
    };

    this.els.prev.addEventListener("click", () => this.prevMonth());
    this.els.next.addEventListener("click", () => this.nextMonth());

    this.renderCalendar(this.currentYear, this.currentMonth);

    console.log("Calendar initialized");
  },

  prevMonth() {
    this.currentMonth--;
    if (this.currentMonth < 1) {
      this.currentMonth = 12;
      this.currentYear--;
    }
    this.renderCalendar(this.currentYear, this.currentMonth);
  },

  nextMonth() {
    this.currentMonth++;
    if (this.currentMonth > 12) {
      this.currentMonth = 1;
      this.currentYear++;
    }
    this.renderCalendar(this.currentYear, this.currentMonth);
  },

  async renderCalendar(year, month) {
    this.els.title.textContent = `${this.MONTH_NAMES[month - 1]} ${year}`;

    const data = await API.fetchEvents(year, month);
    this.events = data ? data.events : [];

    const daysInMonth = new Date(year, month, 0).getDate();
    // 0 = Sunday, convert to Mon=0 ... Sun=6
    const firstDayRaw = new Date(year, month - 1, 1).getDay();
    const offset = (firstDayRaw + 6) % 7;

    const today = new Date();
    const isCurrentMonth =
      today.getFullYear() === year && today.getMonth() + 1 === month;

    let html = "";

    // Empty cells before first day
    for (let i = 0; i < offset; i++) {
      html += '<div class="cal-day cal-day-empty"></div>';
    }

    // Day cells
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const isToday = isCurrentMonth && today.getDate() === day;
      const dayEvents = this.getEventsForDay(dateStr);

      const todayClass = isToday ? " cal-day-today" : "";
      const hasEvents = dayEvents.length > 0 ? " cal-day-has-events" : "";

      html += `<div class="cal-day cal-day-active${todayClass}${hasEvents}" data-date="${dateStr}">`;
      html += `<span class="cal-day-number">${day}</span>`;

      if (dayEvents.length > 0) {
        html += '<div class="cal-day-events">';
        const maxDots = Math.min(dayEvents.length, 3);
        for (let i = 0; i < maxDots; i++) {
          html += '<span class="cal-event-dot"></span>';
        }
        html += "</div>";
      }

      html += "</div>";
    }

    // Empty cells after last day
    const totalCells = offset + daysInMonth;
    const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let i = 0; i < remaining; i++) {
      html += '<div class="cal-day cal-day-empty"></div>';
    }

    this.els.grid.innerHTML = html;

    // Click handlers on active days
    this.els.grid.querySelectorAll(".cal-day-active").forEach((el) => {
      el.addEventListener("click", () => this.handleDayClick(el.dataset.date));
    });
  },

  getEventsForDay(dateStr) {
    return this.events.filter((event) => {
      const start = event.start.dateTime || event.start.date;
      return start.startsWith(dateStr);
    });
  },

  handleDayClick(dateStr) {
    console.log("Day clicked:", dateStr);
    Booking.openBookingModal(dateStr);
  },
};

window.Calendar = Calendar;
