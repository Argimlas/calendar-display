const Booking = {
  els: {},

  initQuickBooking() {
    this.els = {
      btn: document.getElementById("quickbook-btn"),
      duration: document.getElementById("quickbook-duration"),
    };

    this.els.btn.addEventListener("click", () => this.handleQuickBook());

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
