from gpiozero import Button
import subprocess

button = Button(3, pull_up=True, hold_time=2)
button.when_held = lambda: subprocess.run(["sudo", "shutdown", "-h", "now"])

from signal import pause
pause()
