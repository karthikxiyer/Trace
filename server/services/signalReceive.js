const RPC_URL = process.env.SIGNAL_RPC_URL || 'http://localhost:7583';

export async function receiveMessages() {
  const res = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', method: 'receive', id: 1 }),
  });
  const data = await res.json();
  const envelopes = data.result || [];

  return envelopes
    .filter(e => e.envelope?.dataMessage?.message)
    .map(e => ({
      sender: e.envelope.sourceNumber,
      message: e.envelope.dataMessage.message,
    }));
}
