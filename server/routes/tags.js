import { Router } from 'express';
import pool from '../db/index.js';
import { verifyToken } from '../middleware/auth.js';
import { invalidateUserLinks } from '../services/cache.js';

const router = Router();
router.use(verifyToken);

// GET /api/tags
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM tags WHERE user_id = $1 ORDER BY name',
      [req.user.id]
    );
    res.json({ tags: result.rows });
  } catch (err) {
    console.error('get tags error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/tags
router.post('/', async (req, res) => {
  const { name, color = '#888888' } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Name required' });

  try {
    const result = await pool.query(
      'INSERT INTO tags (user_id, name, color) VALUES ($1, $2, $3) RETURNING *',
      [req.user.id, name.trim(), color]
    );
    res.status(201).json({ tag: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Tag already exists' });
    console.error('create tag error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/tags/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM tags WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Tag not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('delete tag error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/tags/:tagId/links/:linkId
router.post('/:tagId/links/:linkId', async (req, res) => {
  try {
    const result = await pool.query(
      `INSERT INTO link_tags (link_id, tag_id)
       SELECT l.id, t.id
       FROM links l, tags t
       WHERE l.id = $1 AND l.user_id = $3
         AND t.id = $2 AND t.user_id = $3
       ON CONFLICT DO NOTHING
       RETURNING link_id`,
      [req.params.linkId, req.params.tagId, req.user.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Link or tag not found' });
    invalidateUserLinks(req.user.id);
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('add tag to link error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/tags/:tagId/links/:linkId
router.delete('/:tagId/links/:linkId', async (req, res) => {
  try {
    await pool.query(
      `DELETE FROM link_tags
       WHERE link_id = $1 AND tag_id = $2
         AND EXISTS (SELECT 1 FROM links WHERE id = $1 AND user_id = $3)`,
      [req.params.linkId, req.params.tagId, req.user.id]
    );
    invalidateUserLinks(req.user.id);
    res.json({ success: true });
  } catch (err) {
    console.error('remove tag from link error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
