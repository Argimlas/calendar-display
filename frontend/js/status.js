const StatusDisplay = {
  els: {},
  intervalId: null,

  init() {
    this.els = {
      section: document.getElementById("status-section"),
      badge: document.getElementById("status-badge"),
      time: document.getElementById("status-time"),
      detail: document.getElementById("status-detail"),
      currentEvent: document.getElementById("status-current-event"),
      nextEvent: document.getElementById("status-next-event"),
    };

    this.updateTime();
    setInterval(() => this.updateTime(), 1000);

    this.updateStatus();
    this.intervalId = setInterval(() => this.updateStatus(), 30000);

    console.log("StatusDisplay initialized (30s refresh)");
  },

  updateTime() {
    const now = new Date();
    this.els.time.textContent = now.toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  },

  formatTime(dateStr) {
    return new Date(dateStr).toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  },

  async updateStatus() {
    try {
      const data = await API.fetchStatus();
      if (!data) return;

      if (data.isOccupied) {
        this.showOccupied(data.currentEvent, data.nextEvent);
      } else {
        this.showFree(data.nextEvent);
      }
    } catch (err) {
      console.error("StatusDisplay update failed:", err);
    }
  },

  showOccupied(currentEvent, nextEvent) {
    this.els.section.className =
      "status-badge rounded-xl p-6 bg-red-500/20 border border-red-500/30";
    this.els.badge.textContent = "BELEGT";
    this.els.badge.className = "text-5xl font-bold text-red-400";

    const title = currentEvent.summary || "Kein Titel";
    const end = this.formatTime(
      currentEvent.end.dateTime || currentEvent.end.date,
    );
    this.els.detail.textContent = `${title} — bis ${end}`;
    this.els.detail.className = "text-red-300 mt-1 text-lg";

    this.els.currentEvent.textContent = `Aktuell: ${title}`;
    this.els.currentEvent.classList.remove("hidden");

    if (nextEvent) {
      const nextTitle = nextEvent.summary || "Kein Titel";
      const nextStart = this.formatTime(
        nextEvent.start.dateTime || nextEvent.start.date,
      );
      this.els.nextEvent.textContent = `Danach: ${nextTitle} um ${nextStart}`;
      this.els.nextEvent.classList.remove("hidden");
    } else {
      this.els.nextEvent.classList.add("hidden");
    }
  },

  showFree(nextEvent) {
    this.els.section.className =
      "status-badge rounded-xl p-6 bg-green-500/20 border border-green-500/30";
    this.els.badge.textContent = "FREI";
    this.els.badge.className = "text-5xl font-bold text-green-400";

    this.els.currentEvent.classList.add("hidden");

    if (nextEvent) {
      const title = nextEvent.summary || "Kein Titel";
      const start = this.formatTime(
        nextEvent.start.dateTime || nextEvent.start.date,
      );
      this.els.detail.textContent = `Nächster Termin: ${title} um ${start}`;
      this.els.detail.className = "text-green-300 mt-1 text-lg";
      this.els.nextEvent.textContent = `${title} — ${start}`;
      this.els.nextEvent.classList.remove("hidden");
    } else {
      this.els.detail.textContent = "Keine weiteren Termine heute";
      this.els.detail.className = "text-green-300 mt-1 text-lg";
      this.els.nextEvent.classList.add("hidden");
    }
  },
};

window.StatusDisplay = StatusDisplay;
