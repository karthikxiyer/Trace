import { Router } from 'express';
import pool from '../db/index.js';
import { verifyToken } from '../middleware/auth.js';
import { scrapeMetadata } from '../services/scraper.js';
import { getCache, setCache, invalidateUserLinks } from '../services/cache.js';

const router = Router();
router.use(verifyToken);

const PATCHABLE = ['starred', 'archived', 'read'];

// POST /api/links
router.post('/', async (req, res) => {
  const { url } = req.body;

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO links (user_id, url, domain) VALUES ($1, $2, $3) RETURNING *',
      [req.user.id, url, parsed.hostname]
    );
    const link = result.rows[0];
    res.status(201).json({ link });
    invalidateUserLinks(req.user.id);
    scrapeMetadata(link.id, url);
  } catch (err) {
    console.error('save link error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/links
router.get('/', async (req, res) => {
  const page = Math.max(0, parseInt(req.query.page) || 0);
  const { tag, starred, archived, unread } = req.query;
  const limit = 20;
  const offset = page * limit;

  // Build a stable cache key from all active filters
  const filterParts = [
    `page=${page}`,
    archived === 'true' ? 'archived' : 'live',
    starred === 'true' ? 'starred' : '',
    unread === 'true' ? 'unread' : '',
    tag ? `tag=${tag}` : '',
  ].filter(Boolean).join(':');
  const cacheKey = `links:${req.user.id}:${filterParts}`;

  const cached = await getCache(cacheKey);
  if (cached) return res.json(cached);

  const conditions = ['l.user_id = $1'];
  const values = [req.user.id];
  let idx = 2;

  if (archived === 'true') {
    conditions.push('l.archived = true');
  } else {
    conditions.push('l.archived = false');
  }

  if (starred === 'true') conditions.push('l.starred = true');
  if (unread === 'true') conditions.push('l.read = false');

  if (tag) {
    conditions.push(
      `EXISTS (
        SELECT 1 FROM link_tags lt2
        JOIN tags t2 ON lt2.tag_id = t2.id
        WHERE lt2.link_id = l.id AND t2.name = $${idx} AND t2.user_id = $1
      )`
    );
    values.push(tag);
    idx++;
  }

  values.push(limit, offset);

  const query = `
    SELECT l.*,
      COALESCE(
        json_agg(json_build_object('id', t.id, 'name', t.name, 'color', t.color))
        FILTER (WHERE t.id IS NOT NULL),
        '[]'::json
      ) AS tags
    FROM links l
    LEFT JOIN link_tags lt ON l.id = lt.link_id
    LEFT JOIN tags t ON lt.tag_id = t.id
    WHERE ${conditions.join(' AND ')}
    GROUP BY l.id
    ORDER BY l.created_at DESC
    LIMIT $${idx} OFFSET $${idx + 1}
  `;

  try {
    const result = await pool.query(query, values);
    const payload = { links: result.rows, page, hasMore: result.rows.length === limit };
    await setCache(cacheKey, payload);
    res.json(payload);
  } catch (err) {
    console.error('get links error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/links/:id/content
router.get('/:id/content', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT content FROM links WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json({ content: result.rows[0].content });
  } catch (err) {
    console.error('get content error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/links/:id/notes
router.get('/:id/notes', async (req, res) => {
  try {
    const link = await pool.query(
      'SELECT id FROM links WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (!link.rows[0]) return res.status(404).json({ error: 'Not found' });

    const result = await pool.query(
      'SELECT * FROM notes WHERE link_id = $1 ORDER BY created_at ASC',
      [req.params.id]
    );
    res.json({ notes: result.rows });
  } catch (err) {
    console.error('get notes error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/links/:id/notes
router.post('/:id/notes', async (req, res) => {
  const { content } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: 'Content required' });

  try {
    const link = await pool.query(
      'SELECT id FROM links WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (!link.rows[0]) return res.status(404).json({ error: 'Not found' });

    const result = await pool.query(
      'INSERT INTO notes (link_id, user_id, content) VALUES ($1, $2, $3) RETURNING *',
      [req.params.id, req.user.id, content.trim()]
    );
    res.status(201).json({ note: result.rows[0] });
  } catch (err) {
    console.error('add note error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/links/:id
router.patch('/:id', async (req, res) => {
  const fields = Object.keys(req.body).filter(k => PATCHABLE.includes(k));
  if (fields.length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  const values = fields.map(f => req.body[f]);
  const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');

  try {
    const result = await pool.query(
      `UPDATE links SET ${setClause} WHERE id = $${fields.length + 1} AND user_id = $${fields.length + 2} RETURNING *`,
      [...values, req.params.id, req.user.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Link not found' });
    invalidateUserLinks(req.user.id);
    res.json({ link: result.rows[0] });
  } catch (err) {
    console.error('update link error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/links/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM links WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Link not found' });
    invalidateUserLinks(req.user.id);
    res.json({ success: true });
  } catch (err) {
    console.error('delete link error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
