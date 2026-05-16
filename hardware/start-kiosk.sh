#!/bin/bash

export DISPLAY=:0

echo "Waiting for backend..."
timeout 60 bash -c 'until curl -s http://localhost:3000 > /dev/null; do sleep 2; done'

xset dpms 60 60 60
xset s noblank

unclutter -idle 0.1 -root &

chromium --kiosk --noerrdialogs --disable-infobars --disable-session-crashed-bubble --disable-restore-session-state --no-first-run --disable-features=TranslateUI --password-store=basic --disable-password-generation --touch-events=enabled --disable-pinch --overscroll-history-navigation=0 http://localhost:3000
