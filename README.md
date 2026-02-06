# Raspberry Pi Calendar Display

Local calendar display with Google Calendar integration. Shows room occupancy status, monthly calendar view and allows quick bookings.

## Tech Stack

- Node.js + Express (Backend)
- Vanilla HTML/CSS/JS + TailwindCSS via CDN (Frontend)
- Google Calendar API (OAuth2)

## Setup

### 1. Set up Google Cloud Project

1. Create a new project in the [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the Google Calendar API
3. Create OAuth 2.0 Credentials (Type: Web Application)
4. Add redirect URI: `http://localhost:3000/auth/callback`
5. Download `credentials.json` and place it in `backend/`

### 2. Install

```bash
cp .env.example .env
# Edit .env (CALENDAR_ID, PORT etc.)

cd backend
npm install
```

### 3. Run

```bash
cd backend
npm start
```

On first start, open `http://localhost:3000/auth/google` to complete the OAuth flow.

### 4. Development

```bash
cd backend
npm run dev
```

## Project Structure

```
calendar-display/
├── backend/
│   ├── server.js          # Express Server + API Routes
│   ├── auth.js            # OAuth2 Logic
│   ├── calendar.js        # Google Calendar API Wrapper
│   ├── config.js          # Configuration
│   └── package.json
├── frontend/
│   ├── index.html         # Main UI
│   ├── js/
│   │   ├── app.js         # Main App Logic
│   │   ├── calendar.js    # Calendar Rendering
│   │   ├── status.js      # Status Display
│   │   ├── booking.js     # Booking Dialogs
│   │   └── api.js         # API Calls
│   └── css/
│       └── style.css      # Custom CSS
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
| GET | `/auth/google` | Start OAuth flow |
| GET | `/auth/callback` | OAuth callback |
