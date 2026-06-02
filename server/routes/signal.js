import { Router } from 'express';
import verifyToken from '../middleware/auth.js';
import pool from '../db/index.js';

const router = Router();
const RPC_URL = process.env.SIGNAL_RPC_URL || 'http://localhost:7583';
const ADMIN_USER_ID = process.env.ADMIN_USER_ID;

router.get('/status', async (_req, res) => {
  try {
    const response = await fetch(RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'listAccounts', id: 1 }),
      signal: AbortSignal.timeout(3000),
    });
    const data = await response.json();
    const accounts = data.result || [];
    const connected = accounts.some(a => a.number === process.env.SIGNAL_PHONE_NUMBER);
    res.json({ connected, number: process.env.SIGNAL_PHONE_NUMBER || null });
  } catch {
    res.json({ connected: false, number: process.env.SIGNAL_PHONE_NUMBER || null });
  }
});

router.get('/users', verifyToken, async (req, res) => {
  if (ADMIN_USER_ID && req.user.id !== ADMIN_USER_ID) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const result = await pool.query(`
    SELECT u.signal_phone, u.created_at, COUNT(l.id)::int AS link_count
    FROM users u
    LEFT JOIN links l ON l.user_id = u.id
    WHERE u.signal_phone IS NOT NULL
    GROUP BY u.id
    ORDER BY u.created_at DESC
  `);
  res.json({ users: result.rows });
});

export default router;
