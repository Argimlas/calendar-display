const { google } = require("googleapis");
const auth = require("./auth");
const config = require("./config");

const getCalendarClient = async () => {
  const client = await auth.getAuthenticatedClient();
  if (!client) throw new Error("Not authenticated");
  return google.calendar({ version: "v3", auth: client });
};

const getCurrentStatus = async () => {
  try {
    const calendar = await getCalendarClient();

    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const res = await calendar.events.list({
      calendarId: config.CALENDAR_ID,
      timeMin: now.toISOString(),
      timeMax: endOfDay.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = res.data.items || [];

    const currentEvent =
      events.find((event) => {
        const start = new Date(event.start.dateTime || event.start.date);
        const end = new Date(event.end.dateTime || event.end.date);
        return start <= now && now <= end;
      }) || null;

    const nextEvent =
      events.find((event) => {
        const start = new Date(event.start.dateTime || event.start.date);
        return start > now;
      }) || null;

    return {
      isOccupied: !!currentEvent,
      currentEvent,
      nextEvent,
      currentTime: now.toISOString(),
    };
  } catch (err) {
    console.error("Failed to get current status:", err.message);
    throw err;
  }
};

const getEventsForMonth = async (year, month) => {
  try {
    const calendar = await getCalendarClient();

    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0, 23, 59, 59);

    const res = await calendar.events.list({
      calendarId: config.CALENDAR_ID,
      timeMin: monthStart.toISOString(),
      timeMax: monthEnd.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    });

    return { events: res.data.items || [] };
  } catch (err) {
    console.error("Failed to get events for month:", err.message);
    throw err;
  }
};

const createQuickBooking = async (durationMinutes, title) => {
  try {
    const calendar = await getCalendarClient();

    const start = new Date();
    const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

    const res = await calendar.events.insert({
      calendarId: config.CALENDAR_ID,
      resource: {
        summary: title,
        start: { dateTime: start.toISOString(), timeZone: config.TIMEZONE },
        end: { dateTime: end.toISOString(), timeZone: config.TIMEZONE },
      },
    });

    console.log("Quick booking created:", res.data.id);
    return res.data;
  } catch (err) {
    console.error("Failed to create quick booking:", err.message);
    throw err;
  }
};

const createBooking = async (dateStr, startTime, endTime, title) => {
  try {
    const calendar = await getCalendarClient();

    const start = new Date(`${dateStr}T${startTime}`);
    const end = new Date(`${dateStr}T${endTime}`);

    if (start >= end) {
      throw new Error("Start time must be before end time");
    }

    const res = await calendar.events.insert({
      calendarId: config.CALENDAR_ID,
      resource: {
        summary: title,
        start: { dateTime: start.toISOString(), timeZone: config.TIMEZONE },
        end: { dateTime: end.toISOString(), timeZone: config.TIMEZONE },
      },
    });

    console.log("Booking created:", res.data.id);
    return res.data;
  } catch (err) {
    console.error("Failed to create booking:", err.message);
    throw err;
  }
};

const deleteEvent = async (eventId) => {
  try {
    const calendar = await getCalendarClient();

    await calendar.events.delete({
      calendarId: config.CALENDAR_ID,
      eventId,
    });

    console.log("Event deleted:", eventId);
  } catch (err) {
    console.error("Failed to delete event:", err.message);
    throw err;
  }
};

module.exports = {
  getCurrentStatus,
  getEventsForMonth,
  createQuickBooking,
  createBooking,
  deleteEvent,
};
