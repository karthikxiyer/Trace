#!/bin/sh

echo "[start] Looking for credential files..."
if ls /etc/secrets/signal_part_*.b64 > /dev/null 2>&1; then
  for f in $(ls /etc/secrets/signal_part_*.b64 | sort); do
    echo "[start] $f — $(wc -c < "$f") bytes, first 10 chars: $(head -c 10 "$f")"
  done

  echo "[start] Decoding and reassembling..."
  mkdir -p /signal-data /tmp/signal-restore

  for f in $(ls /etc/secrets/signal_part_*.b64 | sort); do
    base64 -d "$f" >> /tmp/signal-restore/data.tar.gz
  done

  echo "[start] Reassembled size: $(wc -c < /tmp/signal-restore/data.tar.gz) bytes"
  echo "[start] Magic bytes: $(xxd /tmp/signal-restore/data.tar.gz | head -1)"

  tar xzf /tmp/signal-restore/data.tar.gz -C /signal-data \
    && echo "[start] Credentials restored OK" \
    || echo "[start] ERROR: tar extract failed"

  rm -rf /tmp/signal-restore
else
  echo "[start] WARNING: No credential files found"
fi

echo "[start] Starting signal-cli..."
signal-cli \
  --config /signal-data \
  -a "$SIGNAL_PHONE_NUMBER" \
  jsonRpc \
  --http \
  --port 7583 >> /proc/1/fd/1 2>&1 &

SIGNAL_PID=$!
sleep 8

if kill -0 $SIGNAL_PID 2>/dev/null; then
  echo "[start] signal-cli is running (PID $SIGNAL_PID)"
else
  echo "[start] ERROR: signal-cli exited early"
fi

node index.js
