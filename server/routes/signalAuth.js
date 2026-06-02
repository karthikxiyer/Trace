import { Router } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../db/index.js';
import { consumeToken } from '../services/signalTokens.js';

const router = Router();

router.get('/', async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ error: 'Missing token.' });

  const userId = await consumeToken(token);
  if (!userId) {
    return res.status(400).json({
      error: 'Link expired or already used. Send "login" to the bot for a new one.',
    });
  }

  const result = await pool.query('SELECT id, email, signal_phone FROM users WHERE id = $1', [userId]);
  const user = result.rows[0];

  const jwtToken = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  res.json({ token: jwtToken, user });
});

export default router;
