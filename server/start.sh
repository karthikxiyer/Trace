#!/bin/sh
signal-cli \
  --config /signal-data \
  -a "$SIGNAL_PHONE_NUMBER" \
  jsonRpc \
  --http \
  --port 7583 &
sleep 4
node index.js
