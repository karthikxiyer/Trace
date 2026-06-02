#!/bin/sh
# Restore signal-cli credentials from env var (free-plan alternative to persistent disk)
if [ -n "$SIGNAL_DATA_B64" ]; then
  mkdir -p /signal-data
  echo "$SIGNAL_DATA_B64" | base64 -d | tar xzf - -C /signal-data
fi

signal-cli \
  --config /signal-data \
  -a "$SIGNAL_PHONE_NUMBER" \
  jsonRpc \
  --http \
  --port 7583 &
sleep 4
node index.js
