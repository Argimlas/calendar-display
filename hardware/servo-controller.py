#!/usr/bin/env python3
"""
Servo-Controller für Raumkalender-Display.
Pollt /api/hardware/servo und dreht Servo auf FREI/BELEGT Position.
Nutzt gpiozero (kein Daemon nötig).
"""

import time
import sys
import signal
import requests
from gpiozero import AngularServo, LED

# === KONFIGURATION ===
API_URL = "http://localhost:3000/api/hardware/servo"
POLL_INTERVAL = 10  # Sekunden zwischen Status-Checks
GPIO_PIN = 18       # BCM-Nummer (Servo)
LED_ROT_PIN = 23
LED_GRUEN_PIN = 24
led_rot = None
led_gruen = None

# Servo-Positionen in Grad (-90 bis +90 bei AngularServo)
# Anpassen je nach Montage der Scheibe!
POS_FREI = -90      # Grad für "FREI"
POS_BELEGT = 90      # Grad für "BELEGT"

# SG90 Pulseweiten-Bereich (Standard passt meist)
MIN_PULSE = 0.0005  # 500µs
MAX_PULSE = 0.0025  # 2500µs

# === GLOBALS ===
servo = None
current_state = None


def setup():
    """Servo initialisieren und in Ausgangsposition drehen."""
    global servo, led_rot, led_gruen
    led_rot = LED(LED_ROT_PIN)
    led_gruen = LED(LED_GRUEN_PIN)
    servo = AngularServo(
        GPIO_PIN,
        min_angle=-90,
        max_angle=90,
        min_pulse_width=MIN_PULSE,
        max_pulse_width=MAX_PULSE,
    )
    print(f"Servo auf GPIO {GPIO_PIN} initialisiert")
    move_servo(POS_FREI)


def move_servo(angle):
    """Servo auf Winkel drehen, dann Signal stoppen (spart Strom, kein Brummen)."""
    servo.angle = angle
    time.sleep(0.5)
    servo.detach()  # Signal aus → Servo hält Position, brummt nicht


def update_servo(occupied):
    """Servo nur bewegen wenn sich Status geändert hat."""
    global current_state
    if occupied == current_state:
        return

    current_state = occupied
    if occupied:
        print(f"[{time.strftime('%H:%M:%S')}] Status: BELEGT → Servo dreht auf {POS_BELEGT}°")
        move_servo(POS_BELEGT)
        led_rot.on()
        led_gruen.off()
    else:
        print(f"[{time.strftime('%H:%M:%S')}] Status: FREI → Servo dreht auf {POS_FREI}°")
        move_servo(POS_FREI)
        led_rot.off()
        led_gruen.on()


def poll_status():
    """Status vom Backend abfragen."""
    try:
        resp = requests.get(API_URL, timeout=5)
        resp.raise_for_status()
        data = resp.json()
        return data.get("occupied", False)
    except requests.exceptions.ConnectionError:
        print(f"[{time.strftime('%H:%M:%S')}] Backend nicht erreichbar, versuche erneut...")
        return None
    except Exception as e:
        print(f"[{time.strftime('%H:%M:%S')}] Fehler: {e}")
        return None


def cleanup(signum=None, frame=None):
    """Aufräumen bei Beenden."""
    print("\nServo-Controller wird beendet...")
    if led_rot: led_rot.close()
    if led_gruen: led_gruen.close()
    if servo:
        servo.detach()
        servo.close()
    sys.exit(0)


def main():
    signal.signal(signal.SIGTERM, cleanup)
    signal.signal(signal.SIGINT, cleanup)

    print("=== Servo-Controller gestartet (gpiozero) ===")
    print(f"Polling {API_URL} alle {POLL_INTERVAL}s")
    print(f"GPIO: {GPIO_PIN} | FREI: {POS_FREI}° | BELEGT: {POS_BELEGT}°")

    setup()

    # Warte bis Backend bereit ist
    while True:
        status = poll_status()
        if status is not None:
            update_servo(status)
            break
        time.sleep(3)

    # Hauptschleife
    while True:
        time.sleep(POLL_INTERVAL)
        status = poll_status()
        if status is not None:
            update_servo(status)


if __name__ == "__main__":
    main()
