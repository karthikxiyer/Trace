#!/bin/sh
# Restore signal-cli credentials from split secret files
if ls /etc/secrets/signal_part_*.b64 > /dev/null 2>&1; then
  mkdir -p /signal-data
  for f in $(ls /etc/secrets/signal_part_*.b64 | sort); do
    base64 -d "$f"
  done | tar xzf - -C /signal-data
fi

signal-cli \
  --config /signal-data \
  -a "$SIGNAL_PHONE_NUMBER" \
  jsonRpc \
  --http \
  --port 7583 &
sleep 4
node index.js
