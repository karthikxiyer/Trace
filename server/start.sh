#!/bin/sh
set -e

# Restore signal-cli credentials from split secret files
echo "[start] Looking for credential files..."
if ls /etc/secrets/signal_part_*.b64 > /dev/null 2>&1; then
  echo "[start] Found credential files, restoring..."
  mkdir -p /signal-data
  for f in $(ls /etc/secrets/signal_part_*.b64 | sort); do
    echo "[start] Decoding $f"
    base64 -d "$f"
  done | tar xzf - -C /signal-data
  echo "[start] Credentials restored. Contents of /signal-data:"
  ls -la /signal-data/
else
  echo "[start] WARNING: No credential files found at /etc/secrets/signal_part_*.b64"
fi

echo "[start] Starting signal-cli..."
signal-cli \
  --config /signal-data \
  -a "$SIGNAL_PHONE_NUMBER" \
  jsonRpc \
  --http \
  --port 7583 >> /proc/1/fd/1 2>&1 &

SIGNAL_PID=$!
echo "[start] signal-cli started with PID $SIGNAL_PID"
echo "[start] Waiting 8s for signal-cli to initialize..."
sleep 8

if kill -0 $SIGNAL_PID 2>/dev/null; then
  echo "[start] signal-cli is running"
else
  echo "[start] ERROR: signal-cli exited early"
fi

echo "[start] Starting Node.js..."
node index.js
