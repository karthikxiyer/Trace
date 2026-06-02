import crypto from 'crypto';
import pool from '../db/index.js';

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

export async function generateMagicLink(userId) {
  const token = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await pool.query(
    'INSERT INTO signal_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [userId, token, expiresAt]
  );

  return `${CLIENT_URL}/auth/signal?token=${token}`;
}

export async function consumeToken(token) {
  const result = await pool.query(
    'SELECT user_id FROM signal_tokens WHERE token = $1 AND used = false AND expires_at > NOW()',
    [token]
  );
  if (result.rows.length === 0) return null;

  await pool.query('UPDATE signal_tokens SET used = true WHERE token = $1', [token]);
  return result.rows[0].user_id;
}
