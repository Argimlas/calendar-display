document.addEventListener("DOMContentLoaded", () => {
  console.log("Calendar Display app starting...");

  StatusDisplay.init();
  Booking.initQuickBooking();
  Calendar.initCalendar();

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
