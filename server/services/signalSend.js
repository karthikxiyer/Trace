const RPC_URL = process.env.SIGNAL_RPC_URL || 'http://localhost:7583';

export async function sendSignalMessage(recipient, message) {
  try {
    await fetch(RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'send',
        params: { recipient: [recipient], message },
        id: 1,
      }),
    });
  } catch (err) {
    console.error('[signal-send] error:', err.message);
  }
}
