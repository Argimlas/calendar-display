const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const config = {
  PORT: process.env.PORT || 3000,
  CALENDAR_ID: process.env.CALENDAR_ID,
  TIMEZONE: process.env.TZ || "Europe/Berlin",
};

const required = ["CALENDAR_ID"];
for (const key of required) {
  if (!config[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

module.exports = config;
