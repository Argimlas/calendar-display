# Raspberry Pi Calendar Display

Local calendar display with Google Calendar integration. Shows room occupancy status, monthly calendar view, quick bookings, and recurring reservations.

> **Deploying to a Raspberry Pi?** See [PI-DEPLOYMENT-GUIDE.md](PI-DEPLOYMENT-GUIDE.md) for the full setup including kiosk mode, hardware (servo, LEDs, shutdown button), and PM2 auto-start.
>
> **Developing with AI?** See [AI-CONTEXT.md](AI-CONTEXT.md) for a structured codebase overview optimized for AI assistants.

## Tech Stack

- Node.js + Express (Backend)
- Vanilla HTML/CSS/JS + TailwindCSS via CDN (Frontend)
- Google Calendar API (Service Account)

## Setup

### 1. Set up Google Cloud Project & Service Account

1. Create a new project in the [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the Google Calendar API
3. Go to **IAM & Admin → Service Accounts** → Create Service Account
4. Create a JSON key for the service account and download it
5. Place the key file as `backend/service-account.json`

### 2. Share your Calendar with the Service Account

1. Open [Google Calendar](https://calendar.google.com/) → Settings for your calendar
2. Under **Share with specific people**, add the service account email (e.g. `name@project.iam.gserviceaccount.com`)
3. Set permission to **Make changes to events**

### 3. Configure Environment

Copy `.env.example` to `.env` and set at least `CALENDAR_ID`.

```bash
cp .env.example .env
# Edit .env (CALENDAR_ID, PORT, TZ)
```

### 4. Install Dependencies

```bash
cd backend
npm install
```

### 5. Run

```bash
cd backend
npm start
```

The frontend is served by the backend. Open `http://localhost:3000/` in your browser.

### 6. Development

```bash
cd backend
npm run dev
```

## Behavior Notes

- The status badge refreshes every 30 seconds and the calendar refreshes every 5 minutes.
- Quick booking is only allowed if the room is currently free.
- Both quick bookings and reservations require a confirmation step before being created.
- Booked events cannot be deleted through the UI.
- Reservations can optionally be set as recurring (daily / weekly / monthly) with an end date.

## Project Structure

```
calendar-display/
├── backend/
│   ├── server.js              # Express Server + API Routes
│   ├── auth.js                # Service Account Authentication
│   ├── calendar.js            # Google Calendar API Wrapper
│   ├── config.js              # Configuration
│   ├── service-account.json   # Service Account Key (not in git)
│   └── package.json
├── frontend/
│   ├── index.html             # Main UI
│   ├── js/
│   │   ├── app.js             # Main App Logic
│   │   ├── calendar.js        # Calendar Rendering
│   │   ├── status.js          # Status Display
│   │   ├── booking.js         # Booking Dialogs
│   │   ├── api.js             # API Calls
│   │   └── virtual-keyboard.js # On-Screen QWERTZ Keyboard
│   └── css/
│       └── style.css          # Custom CSS
├── hardware/
│   ├── servo-controller.py    # Servo + LED controller (polls API every 10s)
│   ├── shutdown-button.py     # Clean shutdown via GPIO 3 (hold 2s)
│   ├── start-kiosk.sh         # Launches Chromium in kiosk mode
│   └── calendar-display.desktop # LXDE autostart entry
├── .env.example
├── .gitignore
├── AI-CONTEXT.md
├── PI-DEPLOYMENT-GUIDE.md
└── README.md
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/status` | Current room status |
| GET | `/api/events?month=YYYY-MM` | Events for a given month |
| POST | `/api/quickbook` | Quick booking starting now |
| POST | `/api/book` | Future reservation (supports optional recurrence) |
