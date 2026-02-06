document.addEventListener("DOMContentLoaded", () => {
  console.log("Calendar Display app starting...");

  StatusDisplay.init();
  Booking.initQuickBooking();
  Calendar.initCalendar();

  console.log("App initialized");
});
