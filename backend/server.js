const express = require("express");
const cors = require("cors");
const path = require("path");
const config = require("./config");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, "..", "frontend")));

// --- API Routes ---

app.get("/api/status", (req, res) => {
  res.json({
    isOccupied: false,
    currentEvent: null,
    nextEvent: null,
    currentTime: new Date().toISOString(),
  });
});

app.get("/api/events", (req, res) => {
  const { month } = req.query;
  res.json({ events: [], month: month || null });
});

app.post("/api/quickbook", (req, res) => {
  const { duration } = req.body;
  res.json({ success: true, duration });
});

app.post("/api/book", (req, res) => {
  const { date, startTime, endTime, title } = req.body;
  res.json({ success: true, date, startTime, endTime, title });
});

// --- Auth Routes (placeholder) ---

app.get("/auth/google", (req, res) => {
  res.json({ message: "OAuth flow not yet implemented" });
});

app.get("/auth/callback", (req, res) => {
  res.json({ message: "OAuth callback not yet implemented" });
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
