#!/bin/sh

# Restore signal-cli credentials from split secret files
if ls /etc/secrets/signal_part_*.b64 > /dev/null 2>&1; then
  mkdir -p /signal-data /tmp/sr
  for f in $(ls /etc/secrets/signal_part_*.b64 | sort); do
    base64 -d "$f" >> /tmp/sr/data.tar.gz
  done
  tar xzf /tmp/sr/data.tar.gz -C /signal-data && echo "[start] credentials restored" || echo "[start] tar failed"
  rm -rf /tmp/sr
else
  echo "[start] no credential files found"
fi

# Start signal-cli in background, inheriting stdout/stderr so errors appear in Render logs
signal-cli \
  -d /signal-data \
  -a "$SIGNAL_PHONE_NUMBER" \
  jsonRpc \
  --http \
  --port 7583 &

sleep 8
node index.js
