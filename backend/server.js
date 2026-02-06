const express = require("express");
const cors = require("cors");
const path = require("path");
const config = require("./config");
const auth = require("./auth");

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
