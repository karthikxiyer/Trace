import fetch from 'node-fetch';
import { load } from 'cheerio';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import pool from '../db/index.js';

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
};

function titleFromSlug(url) {
  try {
    const parts = new URL(url).pathname.split('/').filter(Boolean);
    const slug = parts.at(-1);
    if (!slug || slug.length < 4) return null;
    return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  } catch { return null; }
}

export async function scrapeMetadata(linkId, url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  let title = null, description = null, og_image = null, content = null;

  try {
    const res = await fetch(url, { signal: controller.signal, headers: BROWSER_HEADERS });
    clearTimeout(timeout);

    if (res.ok) {
      const html = await res.text();
      const $ = load(html);

      title =
        $('meta[property="og:title"]').attr('content') ||
        $('title').text().trim() ||
        null;
      description =
        $('meta[name="description"]').attr('content') ||
        $('meta[property="og:description"]').attr('content') ||
        null;
      og_image = $('meta[property="og:image"]').attr('content') || null;

      // Extract full article content via Readability
      try {
        const dom = new JSDOM(html, { url });
        const reader = new Readability(dom.window.document);
        const article = reader.parse();
        content = article?.content || null;
      } catch { /* some pages aren't parseable */ }
    }
  } catch {
    clearTimeout(timeout);
  }

  if (!title) title = titleFromSlug(url);

  try {
    await pool.query(
      'UPDATE links SET title = $1, description = $2, og_image = $3, content = $4 WHERE id = $5',
      [title, description, og_image, content, linkId]
    );
  } catch (err) {
    console.error('scraper db error', err);
  }
}
