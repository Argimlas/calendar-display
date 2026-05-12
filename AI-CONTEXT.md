# calendar-display — Codebase Overview for AI

## Purpose
Raspberry Pi-based room calendar display for occupancy management. Runs on a Pi 4 with X11/touchscreen. Interface is in German, touch-optimized.

## Tech Stack
- **Backend:** Node.js + Express 4.x, googleapis 144.x, dotenv
- **Frontend:** Vanilla JS (no framework), Tailwind CSS (CDN), no build process
- **Auth:** Google Service Account (migrated from OAuth2)
- **Hardware:** Raspberry Pi 4

## Project Structure
```
calendar-display/
├── backend/
│   ├── server.js          # Express server + REST API routes
│   ├── auth.js            # Google Service Account auth
│   ├── calendar.js        # Google Calendar API wrapper
│   ├── config.js          # Env config (PORT, CALENDAR_ID, TZ)
│   ├── package.json
│   └── service-account.json  # (not in git) Google Service Account key
├── frontend/
│   ├── index.html         # UI structure with Tailwind, modals
│   └── js/
│       ├── app.js             # Entry point, initialization
│       ├── api.js             # Fetch client for backend API
│       ├── status.js          # Room status (free/occupied) display; caches isOccupied
│       ├── calendar.js        # Monthly calendar, event display; caches events[]
│       ├── booking.js         # Booking modal, quick booking, conflict check
│       └── virtual-keyboard.js # QWERTZ on-screen keyboard
│   └── css/
│       └── style.css      # Touch optimizations, Pi-specific CSS
├── hardware/
│   ├── servo-controller.py    # Polls /api/hardware/servo every 10s, controls servo + LEDs
│   ├── shutdown-button.py     # GPIO 3, hold 2s → clean shutdown
│   ├── start-kiosk.sh         # Launches Chromium in kiosk mode (sleep 20, dpms 60s)
│   └── calendar-display.desktop # LXDE autostart entry
├── .env                   # (not in git) PORT, CALENDAR_ID, TZ
└── .env.example
```

## Running
```bash
cd backend && npm install && npm start
# For development:
npm run dev  # nodemon
```
Frontend is served statically by Express at `http://localhost:3000/`.

## REST API
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/status` | Current room status (isOccupied, nextEvent, currentEvent) |
| GET | `/api/events?month=YYYY-MM` | Events for a given month |
| POST | `/api/quickbook` | Instant booking (room must be free); Body: `{ duration, title }` |
| POST | `/api/book` | Future reservation; Body: `{ date, startTime, endTime, title, recurrence? }` — `recurrence` is an optional RRULE array for recurring events (daily/weekly/monthly) |
| DELETE | `/api/events/:eventId` | Delete event (backend route exists, but disabled in the UI) |
| GET | `/api/hardware/servo` | Servo status for Pi hardware (occupied: boolean); respects test override |
| POST | `/api/hardware/servo/test` | Set test override; Body: `{ position: "frei" \| "belegt" }`; expires after 30s |

## Frontend Refresh Intervals
- Room status: every 30 seconds
- Calendar events: every 5 minutes
- Clock: every second

## Important Details
- **Authentication:** Service Account via `backend/service-account.json`, no user login
- **Scope:** `https://www.googleapis.com/auth/calendar`
- **Timezone:** `Europe/Berlin` (configurable via `.env`)
- **Minimum booking duration:** 15 minutes
- **Booking conflict check:** `booking.js` checks against `Calendar.events[]` for overlap before showing the confirm modal
- **Timezone handling:** `createBooking` passes local datetime strings (`YYYY-MM-DDTHH:MM:SS`) with an explicit `timeZone` field to Google Calendar — avoids UTC conversion via `new Date()`
- **XSS protection:** HTML escaping on event rendering
- **Virtual keyboard:** QWERTZ layout, auto-attaches to `<input>` fields

## Configuration (.env)
```
PORT=3000
CALENDAR_ID=<Google Calendar ID>
TZ=Europe/Berlin
```

## Not in Git
- `backend/service-account.json` (Google key)
- `backend/credentials.json`, `backend/token.json` (legacy OAuth2)
- `.env`
