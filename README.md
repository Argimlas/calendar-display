# Raspberry Pi Calendar Display

Local calendar display with Google Calendar integration. Shows room occupancy status, monthly calendar view, quick bookings, and event deletion.

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
- Deleting an event prompts for confirmation.

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
│   │   └── api.js             # API Calls
│   └── css/
│       └── style.css          # Custom CSS
├── .env.example
├── .gitignore
└── README.md
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/status` | Current room status |
| GET | `/api/events?month=YYYY-MM` | Events for a given month |
| POST | `/api/quickbook` | Quick booking starting now |
| POST | `/api/book` | Future reservation |
| DELETE | `/api/events/:eventId` | Delete event by id |
