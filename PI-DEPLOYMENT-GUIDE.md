# Raspberry Pi Kiosk-Mode Deployment - Calendar Display

## Overview

Raspberry Pi-based room calendar display for occupancy management with a touch-optimized interface.

**Tech Stack:**
- Backend: Node.js + Express, Google Calendar API (Service Account auth)
- Frontend: Vanilla JS, Tailwind CSS (CDN)
- Hardware: Raspberry Pi 4 with touch display, servo motor, status LEDs, shutdown button

---

## Prerequisites

- Raspberry Pi 4 Model B with Raspberry Pi OS
- Touch display connected
- Network (LAN/WLAN) configured
- SSH enabled
- Google Service Account created with Calendar API access

---

## 1. Prepare the System

```bash
sudo apt update
sudo apt upgrade -y
```

---

## 2. Install Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

**Verify:**
```bash
node --version  # v20.x.x
npm --version   # 10.x.x
```

---

## 3. Clone the Project onto the Pi

```bash
cd ~
git clone https://github.com/USERNAME/calendar-display.git
cd calendar-display/backend
npm install
```

**Note:** Use HTTPS (no token needed for public repos) or SSH.

---

## 4. Configure Google Service Account

### 4.1 Transfer the Service Account JSON to the Pi

**On your PC (from the calendar-display folder):**
```bash
scp backend/service-account.json pi@PI_IP:/home/pi/calendar-display/backend/
```

**Note:** Replace `PI_IP` with your Pi's IP address.

**Verify on the Pi:**
```bash
ls ~/calendar-display/backend/service-account.json
```

### 4.2 Create the .env File

```bash
cp ~/calendar-display/.env.example ~/calendar-display/.env
nano ~/calendar-display/.env
```

Enter your `CALENDAR_ID`, save with `Ctrl+O` → Enter → `Ctrl+X`.

**Notes:**
- `CALENDAR_ID`: Google Calendar ID (found in Google Calendar → Settings → Calendar ID)
- The service account must have access to the calendar (share as editor)

---

## 5. Test the Server

```bash
cd ~/calendar-display/backend
node server.js
```

**In your browser (on your PC):**
```
http://PI_IP:3000
```

**Expected result:**
- Calendar display loads
- Status is shown (FREE/OCCUPIED)
- No auth errors in the console

**Stop the server:** `Ctrl+C`

---

## 6. Install PM2 for Auto-Start

```bash
sudo npm install -g pm2
cd ~/calendar-display/backend
pm2 start server.js --name calendar-display
```

**Check PM2 status:**
```bash
pm2 status
# Should show "online"
```

**Set up auto-start on boot:**
```bash
pm2 startup
```

**Run the displayed command (copy-paste), then:**
```bash
pm2 save
```

**Test:**
```bash
sudo reboot
# After reboot:
pm2 status
# calendar-display should be "online"
```

---

## 7. Hardware Setup (Servo, LEDs, Shutdown Button)

### 7.1 GPIO Pin Layout

| Component | GPIO (BCM) | Pi Pin | Cable |
|-----------|-----------|--------|-------|
| Servo Signal | GPIO 18 | Pin 12 | Orange/Yellow |
| Servo VCC | — | Pin 2 (5V) | Red |
| Servo GND | — | Pin 6 (GND) | Brown/Black |
| LED Red | GPIO 23 | Pin 16 | + 220–330 Ω resistor |
| LED Green | GPIO 24 | Pin 18 | + 220–330 Ω resistor |
| Shutdown Button | GPIO 3 | Pin 5 | Button between Pin 5 and GND (Pin 9) |

**Notes:**
- GPIO 18 supports hardware PWM → no servo jitter
- Always use a resistor (220–330 Ω) with LEDs
- Shutdown button needs no external resistor (use internal pull-up)
- GPIO 3 has the special property of waking the Pi from halt state → ideal as a power button

### 7.2 Install Python Dependencies

```bash
sudo apt install -y pigpio python3-gpiozero python3-requests

# Enable pigpio daemon (hardware PWM for servo)
sudo systemctl enable pigpiod
sudo systemctl start pigpiod

# Verify:
systemctl status pigpiod
# Should show "active (running)"
```

### 7.3 Start the Servo Controller as a PM2 Process

The servo controller lives in the repo at `hardware/servo-controller.py` and runs as a standalone PM2 process — independent of the Node.js backend.

```bash
pm2 start ~/calendar-display/hardware/servo-controller.py \
  --name servo-controller \
  --interpreter python3

pm2 save
```

**Check PM2 status:**
```bash
pm2 status
# Should show BOTH processes "online":
# ┌─ calendar-display   online ─┐
# └─ servo-controller   online ─┘
```

**Check logs:**
```bash
pm2 logs servo-controller
# Expected output:
# === Servo-Controller gestartet (gpiozero) ===
# Polling http://localhost:3000/api/hardware/servo alle 10s
# [HH:MM:SS] Status: FREI → Servo dreht auf -90°
```

**Note on PWMSoftwareFallback warning:** If the error log shows `PWMSoftwareFallback: To reduce servo jitter, use the pigpio pin factory` but pigpiod is running, add these lines at the top of `servo-controller.py`:

```python
from gpiozero.pins.pigpio import PiGPIOFactory
from gpiozero import Device
Device.pin_factory = PiGPIOFactory()
```

Then run `pm2 restart servo-controller`.

### 7.4 Set Up the Shutdown Button

Cutting power to the Pi can corrupt the SD card. The shutdown button triggers a clean shutdown.

The script lives in the repo at `hardware/shutdown-button.py`. Start it as a PM2 process:

```bash
pm2 start ~/calendar-display/hardware/shutdown-button.py \
  --name shutdown-button \
  --interpreter python3

pm2 save
```

**Behavior:**
- Hold button for **2 seconds** → clean shutdown (`shutdown -h now`)
- Short press → nothing happens (prevents accidental shutdown)
- After shutdown: press button again → Pi boots (GPIO 3 property)

---

## 8. Enable X11 (for Touch Compatibility)

```bash
sudo raspi-config
```

**Navigate:**
1. **6 Advanced Options**
2. **A6 Wayland**
3. Select **W1 X11**
4. **OK**
5. **Finish**
6. **Yes** (Reboot)

**Why X11?** Better touch event handling and compatibility with Chromium kiosk mode.

---

## 9. Install Chromium & Dependencies

```bash
sudo apt install -y chromium unclutter
```

- **chromium:** Browser for kiosk mode
- **unclutter:** Hides the mouse cursor when inactive

---

## 10. Make the Kiosk Script Executable

The script lives in the repo at `hardware/start-kiosk.sh` and must be made executable after cloning:

```bash
chmod +x ~/calendar-display/hardware/start-kiosk.sh
```

**Kiosk script flags explained:**
- `--kiosk`: Fullscreen without browser UI
- `--touch-events=enabled`: Enable touch support
- `--disable-pinch`: Prevents accidental zooming
- `--password-store=basic`: No keyring popup

---

## 11. Configure Auto-Start

The desktop entry lives in the repo at `hardware/calendar-display.desktop` and must be copied to the autostart folder:

```bash
mkdir -p ~/.config/autostart
cp ~/calendar-display/hardware/calendar-display.desktop ~/.config/autostart/
```

**Verify the path is correct:**
```bash
cat ~/.config/autostart/calendar-display.desktop
# Exec= must be: /home/pi/calendar-display/hardware/start-kiosk.sh
```

---

## 12. Final Reboot & Deployment Test

```bash
sudo reboot
```

**After reboot (~1 minute):**

✅ **Expected behavior:**
1. Pi boots
2. PM2 automatically starts the backend (port 3000)
3. PM2 automatically starts the servo controller
4. PM2 automatically starts the shutdown button
5. Desktop loads (briefly visible)
6. Chromium opens automatically in fullscreen
7. Calendar display is shown
8. Servo rotates to FREE position, green LED lights up
9. Touch scrolling works
10. Virtual keyboard appears on input focus
11. After 1 minute of inactivity: screensaver (touch to wake)

**Check PM2 status:**
```bash
pm2 status
# Should show 3 processes "online":
# calendar-display, servo-controller, shutdown-button
```

---

## Troubleshooting

### Backend not running

```bash
# Check logs:
pm2 logs calendar-display

# Common errors:
# - service-account.json missing
# - CALENDAR_ID incorrect
# - Service account has no access to the calendar

# Start server manually (for debugging):
cd ~/calendar-display/backend
node server.js
```

### Servo not responding

```bash
# Check logs:
pm2 logs servo-controller

# Check servo endpoint manually:
curl http://localhost:3000/api/hardware/servo
# Should return { "occupied": false } or { "occupied": true }

# Start script manually (for debugging):
cd ~/calendar-display/hardware
python3 servo-controller.py

# Is pigpiod running?
systemctl status pigpiod
# If not: sudo systemctl start pigpiod
```

### LEDs not lighting up

```bash
# Check GPIO:
python3 -c "from gpiozero import LED; l = LED(23); l.on(); import time; time.sleep(2); l.off()"
# LED on GPIO 23 should briefly light up

# If no response: check wiring and resistors
```

### Shutdown button not working

```bash
# Check logs:
pm2 logs shutdown-button

# Test manually:
python3 ~/calendar-display/hardware/shutdown-button.py
# Hold button for 2 seconds → shutdown should trigger
```

### Chromium not starting in kiosk mode

```bash
# Test manually:
DISPLAY=:0 ~/calendar-display/hardware/start-kiosk.sh

# Check auto-start:
ls ~/.config/autostart/calendar-display.desktop

# Check logs:
journalctl -xe | grep chromium
```

### Touch not working

```bash
# Check touch device:
DISPLAY=:0 xinput list
# Should show a touch device (e.g. FT5406, xwayland-touch)

# Check if X11 is active:
echo $XDG_SESSION_TYPE
# Should show "x11" (not "wayland")
```

### Service Account auth error

```bash
# Check service-account.json:
cat ~/calendar-display/backend/service-account.json
# Should be valid JSON with a private_key field

# Check calendar sharing:
# Google Calendar → Settings → Share with specific people
# Add service account email with "Make changes to events" permission
```

### Virtual keyboard not appearing

```bash
# Open browser console (if possible):
# Check for JavaScript errors

# Keyboard attaches automatically on <input> focus
# See frontend/js/virtual-keyboard.js
```

---

## Deploying Updates

### On your PC:

```bash
cd calendar-display
git add .
git commit -m "Update XYZ"
git push
```

### On the Pi:

```bash
cd ~/calendar-display
git pull
cd backend
npm install  # if package.json changed
pm2 restart calendar-display
pm2 restart servo-controller  # if hardware/servo-controller.py changed
```

**No reboot needed** — PM2 restarts the server, the browser reloads automatically.

---

## Kiosk-Mode Features

| Feature | Status | Description |
|---------|--------|-------------|
| **Auto-Start** | ✅ | Server and kiosk start on boot |
| **Service Account** | ✅ | No user interaction, automatic auth |
| **Touch Scroll** | ✅ | Native touch gestures work |
| **Virtual Keyboard** | ✅ | QWERTZ on-screen keyboard on input focus |
| **Screensaver** | ✅ | 1 min inactivity → display off |
| **Status Updates** | ✅ | Every 30s automatically |
| **Calendar Refresh** | ✅ | Every 5 min automatically |
| **Quick Booking** | ✅ | 15min – 24h booking options |
| **Servo Display** | ✅ | Physically rotates to FREE/OCCUPIED |
| **Status LEDs** | ✅ | Green = FREE, Red = OCCUPIED |
| **Shutdown Button** | ✅ | Clean shutdown via button (hold 2s) |

---

## Important Files & Paths

| Path | Description | In Git? |
|------|-------------|---------|
| `/home/pi/calendar-display/` | Project root | ✅ |
| `/home/pi/calendar-display/backend/service-account.json` | Google Service Account key | ❌ |
| `/home/pi/calendar-display/.env` | Environment variables | ❌ |
| `/home/pi/calendar-display/hardware/servo-controller.py` | Servo + LED controller | ✅ |
| `/home/pi/calendar-display/hardware/shutdown-button.py` | Shutdown button script | ✅ |
| `/home/pi/calendar-display/hardware/start-kiosk.sh` | Kiosk start script | ✅ |
| `/home/pi/calendar-display/hardware/calendar-display.desktop` | Auto-start config | ✅ |
| `~/.config/autostart/calendar-display.desktop` | Copy of auto-start entry | Local |

---

## PM2 Commands (Cheat Sheet)

```bash
pm2 status                      # Status of all processes
pm2 logs calendar-display       # Live logs backend
pm2 logs servo-controller       # Live logs servo
pm2 logs shutdown-button        # Live logs shutdown button
pm2 restart calendar-display    # Restart backend
pm2 restart servo-controller    # Restart servo controller
pm2 restart all                 # Restart all processes
pm2 stop calendar-display       # Stop a process
pm2 monit                       # Live monitoring of all processes
```

---

## API Endpoints (Reference)

```bash
# Get status:
curl http://localhost:3000/api/status

# Events for a month:
curl http://localhost:3000/api/events?month=2026-03

# Quick booking (30 min):
curl -X POST http://localhost:3000/api/quickbook \
  -H "Content-Type: application/json" \
  -d '{"duration": 30, "title": "Quick Reservation"}'

# Future booking:
curl -X POST http://localhost:3000/api/book \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-03-20",
    "startTime": "14:00",
    "endTime": "15:30",
    "title": "Meeting"
  }'

# Servo status (for servo controller):
curl http://localhost:3000/api/hardware/servo

# Servo test (calibration):
curl -X POST http://localhost:3000/api/hardware/servo/test \
  -H "Content-Type: application/json" \
  -d '{"position": "belegt"}'
```

---

## Performance Optimizations

### Reduce sleep time (faster kiosk start):

```bash
nano ~/calendar-display/hardware/start-kiosk.sh
```

Change `sleep 20` to `sleep 10` (if the Pi is fast enough).

### Skip the desktop (boot directly to kiosk):

```bash
sudo raspi-config
# 1 System Options → S5 Boot / Auto Login → B2 Console Autologin
```

Then launch the kiosk via `/etc/xdg/lxsession/LXDE-pi/autostart`.

---

## Security Notes

- ✅ Never commit `service-account.json` to Git
- ✅ Never commit `.env` to Git
- ✅ Service account should have minimal permissions (Calendar API only)
- ✅ Pi should run on an isolated VLAN (if publicly accessible)
- ✅ Keep the system updated: `sudo apt update && sudo apt upgrade`

---

## Differences from OAuth2 (Legacy)

**Before (OAuth2):**
- User had to log in
- Token could expire
- Browser popups required

**Now (Service Account):**
- No user interaction
- Token never expires
- Simpler deployment

---

**Project successfully deployed!**

For issues: check the logs (`pm2 logs calendar-display`)
