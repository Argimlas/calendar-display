const StatusDisplay = {
  els: {},
  isOccupied: false,

  init() {
    this.els = {
      section: document.getElementById("status-section"),
      badge: document.getElementById("status-badge"),
      time: document.getElementById("status-time"),
      detail: document.getElementById("status-detail"),
      nextEvent: document.getElementById("status-next-event"),
    };

    this.updateTime();
    setInterval(() => this.updateTime(), 1000);

    this.updateStatus();
    setInterval(() => this.updateStatus(), 30000);

    window.addEventListener("languagechange", () => this.updateStatus());

    console.log("StatusDisplay initialized (30s refresh)");
  },

  updateTime() {
    const now = new Date();
    // intentionally locale-fixed to 24h regardless of UI language
    this.els.time.textContent = now.toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  },

  formatTime(dateStr) {
    // intentionally locale-fixed to 24h regardless of UI language
    return new Date(dateStr).toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  },

  async updateStatus() {
    try {
      const data = await API.fetchStatus();
      if (!data) return;

      this.isOccupied = data.isOccupied;
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
    this.els.badge.textContent = I18n.t("status.occupied");
    this.els.badge.className = "text-5xl font-bold text-red-400";

    const title = currentEvent.summary || I18n.t("common.noTitle");
    const end = this.formatTime(
      currentEvent.end.dateTime || currentEvent.end.date,
    );
    this.els.detail.textContent = I18n.t("status.occupiedDetail", { title, end });
    this.els.detail.className = "text-red-300 mt-1 text-lg";

    if (nextEvent) {
      const nextTitle = nextEvent.summary || I18n.t("common.noTitle");
      const nextStart = this.formatTime(
        nextEvent.start.dateTime || nextEvent.start.date,
      );
      this.els.nextEvent.textContent = I18n.t("status.afterThat", { title: nextTitle, start: nextStart });
      this.els.nextEvent.classList.remove("hidden");
    } else {
      this.els.nextEvent.classList.add("hidden");
    }
  },

  showFree(nextEvent) {
    this.els.section.className =
      "status-badge rounded-xl p-6 bg-green-500/20 border border-green-500/30";
    this.els.badge.textContent = I18n.t("status.free");
    this.els.badge.className = "text-5xl font-bold text-green-400";

    if (nextEvent) {
      const title = nextEvent.summary || I18n.t("common.noTitle");
      const start = this.formatTime(
        nextEvent.start.dateTime || nextEvent.start.date,
      );
      this.els.detail.textContent = I18n.t("status.nextEvent", { title, start });
      this.els.detail.className = "text-green-300 mt-1 text-lg";
      this.els.nextEvent.classList.add("hidden");
    } else {
      this.els.detail.textContent = I18n.t("status.noMoreToday");
      this.els.detail.className = "text-green-300 mt-1 text-lg";
      this.els.nextEvent.classList.add("hidden");
    }
  },
};

window.StatusDisplay = StatusDisplay;
