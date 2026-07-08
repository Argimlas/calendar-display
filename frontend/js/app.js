const App = {
  async refreshAll() {
    StatusDisplay.updateStatus();
    await Calendar.renderCalendar(Calendar.currentYear, Calendar.currentMonth);
    if (Calendar.selectedDate) Calendar.renderPanel(Calendar.selectedDate);
  },
};

window.App = App;

document.addEventListener("DOMContentLoaded", () => {
  console.log("Calendar Display app starting...");

  I18n.init();
  StatusDisplay.init();
  Booking.initQuickBooking();
  Calendar.initCalendar();

  // Status refresh button
  const refreshBtn = document.getElementById("status-refresh-btn");
  const refreshIcon = refreshBtn.querySelector("svg");
  refreshBtn.addEventListener("click", async () => {
    refreshBtn.disabled = true;
    refreshIcon.classList.add("animate-spin");
    try {
      await App.refreshAll();
    } finally {
      refreshIcon.classList.remove("animate-spin");
      refreshBtn.disabled = false;
    }
  });

  // Language toggle button
  document.getElementById("lang-toggle-btn").addEventListener("click", () => {
    I18n.toggle();
  });

  // Help modal
  const helpModal = document.getElementById("help-modal");
  document.getElementById("help-btn").addEventListener("click", () => {
    helpModal.classList.remove("hidden");
  });
  document.getElementById("help-modal-close").addEventListener("click", () => {
    helpModal.classList.add("hidden");
  });
  helpModal.addEventListener("click", (e) => {
    if (e.target === helpModal) helpModal.classList.add("hidden");
  });

  console.log("App initialized");
});
