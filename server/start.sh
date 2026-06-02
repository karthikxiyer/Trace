#!/bin/sh
# Restore signal-cli credentials from secret file (avoids env var size limits)
if [ -f /etc/secrets/signal_data.b64 ]; then
  mkdir -p /signal-data
  base64 -d /etc/secrets/signal_data.b64 | tar xzf - -C /signal-data
fi

signal-cli \
  --config /signal-data \
  -a "$SIGNAL_PHONE_NUMBER" \
  jsonRpc \
  --http \
  --port 7583 &
sleep 4
node index.js
