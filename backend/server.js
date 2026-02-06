const express = require("express");
const cors = require("cors");
const path = require("path");
const config = require("./config");
const auth = require("./auth");
const calendar = require("./calendar");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, "..", "frontend")));

// --- API Routes ---

app.get("/api/status", async (req, res) => {
  try {
    const status = await calendar.getCurrentStatus();
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/events", async (req, res) => {
  try {
    const { month } = req.query;
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res
        .status(400)
        .json({ error: "Parameter month required (YYYY-MM)" });
    }
    const [year, m] = month.split("-").map(Number);
    const data = await calendar.getEventsForMonth(year, m);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/quickbook", async (req, res) => {
  try {
    const { duration, title } = req.body;
    if (!duration || duration <= 0) {
      return res
        .status(400)
        .json({ error: "Valid duration required (in minutes)" });
    }
    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }
    const event = await calendar.createQuickBooking(duration, title.trim());
    res.json({ success: true, event });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/book", async (req, res) => {
  try {
    const { date, startTime, endTime, title } = req.body;
    if (!date || !startTime || !endTime || !title || !title.trim()) {
      return res
        .status(400)
        .json({ error: "date, startTime, endTime and title are required" });
    }
    const event = await calendar.createBooking(date, startTime, endTime, title);
    res.json({ success: true, event });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/events/:eventId", async (req, res) => {
  try {
    const { eventId } = req.params;
    if (!eventId) {
      return res.status(400).json({ error: "eventId is required" });
    }
    await calendar.deleteEvent(eventId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Auth Routes ---

app.get("/auth/google", (req, res) => {
  const url = auth.getAuthUrl();
  if (!url) {
    return res
      .status(500)
      .json({ error: "Failed to generate auth URL. Check credentials.json" });
  }
  res.redirect(url);
});

app.get("/auth/callback", async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.status(400).send("Missing authorization code");
  }

  const token = await auth.getTokenFromCode(code);
  if (!token) {
    return res.status(500).send("Failed to obtain token. Please try again.");
  }

  auth.saveToken(token);
  res.redirect("/?auth=success");
});

app.get("/auth/status", (req, res) => {
  const token = auth.loadToken();
  res.json({ authenticated: token !== null });
});

// --- Error Handler ---

app.use((err, req, res, next) => {
  console.error("Server error:", err.message);
  res.status(500).json({ error: "Internal server error" });
});

// --- Start Server ---

app.listen(config.PORT, () => {
  console.log(`Server running on http://localhost:${config.PORT}`);
  console.log(`Calendar ID: ${config.CALENDAR_ID}`);
  console.log(`Timezone: ${config.TIMEZONE}`);
});
