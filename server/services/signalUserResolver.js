import bcrypt from 'bcrypt';
import crypto from 'crypto';
import pool from '../db/index.js';

export async function findOrCreateUserByPhone(phoneNumber) {
  const existing = await pool.query(
    'SELECT id FROM users WHERE signal_phone = $1',
    [phoneNumber]
  );
  if (existing.rows.length > 0) {
    return { id: existing.rows[0].id, isNew: false };
  }

  const email = `signal_${phoneNumber.replace(/\D/g, '')}@trace.local`;
  const passwordHash = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 12);

  const result = await pool.query(
    'INSERT INTO users (email, password_hash, signal_phone) VALUES ($1, $2, $3) RETURNING id',
    [email, passwordHash, phoneNumber]
  );
  return { id: result.rows[0].id, isNew: true };
}
