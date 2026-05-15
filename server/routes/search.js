import { Router } from 'express';
import pool from '../db/index.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();
router.use(verifyToken);

// GET /api/search?q=
router.get('/', async (req, res) => {
  const { q } = req.query;
  if (!q?.trim()) return res.json({ results: [] });

  // Build prefix-matching tsquery: "react hooks" -> "react:* & hooks:*"
  const words = q.trim().split(/\s+/).map(w => w.replace(/\W/g, '')).filter(Boolean);
  if (!words.length) return res.json({ results: [] });
  const tsQuery = words.map(w => `${w}:*`).join(' & ');

  try {
    const result = await pool.query(
      `SELECT l.*,
          ts_rank(l.search_vector, to_tsquery('english', $1)) AS rank,
          COALESCE(
            json_agg(json_build_object('id', t.id, 'name', t.name, 'color', t.color))
            FILTER (WHERE t.id IS NOT NULL),
            '[]'::json
          ) AS tags
        FROM links l
        LEFT JOIN link_tags lt ON l.id = lt.link_id
        LEFT JOIN tags t ON lt.tag_id = t.id
        WHERE l.user_id = $2
          AND l.search_vector @@ to_tsquery('english', $1)
        GROUP BY l.id
        ORDER BY rank DESC
        LIMIT 20`,
      [tsQuery, req.user.id]
    );
    res.json({ results: result.rows });
  } catch (err) {
    console.error('search error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
