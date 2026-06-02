import pool from '../db/index.js';
import { receiveMessages } from './signalReceive.js';
import { sendSignalMessage } from './signalSend.js';
import { findOrCreateUserByPhone } from './signalUserResolver.js';
import { generateMagicLink } from './signalTokens.js';
import { scrapeMetadata } from './scraper.js';
import { invalidateUserLinks } from './cache.js';

const URL_REGEX = /(https?:\/\/[^\s]+)/i;

async function handleMessage(sender, message) {
  const { id: userId, isNew } = await findOrCreateUserByPhone(sender);
  const text = message.trim();

  if (isNew) {
    const link = await generateMagicLink(userId);
    await sendSignalMessage(sender,
      `👋 Welcome to Trace!\n\nYour personal archive is ready — tap to open:\n${link}\n\n(Link expires in 15 mins. Send 'login' anytime for a new one)\n\nNow send me any URL to save it 🗂️`
    );
    return;
  }

  if (text.toLowerCase() === 'login') {
    const link = await generateMagicLink(userId);
    await sendSignalMessage(sender,
      `Here's your login link — tap to open Trace:\n\n${link}\n\nExpires in 15 minutes.`
    );
    return;
  }

  if (text.toLowerCase() === 'recent') {
    const result = await pool.query(
      'SELECT title, url, created_at FROM links WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5',
      [userId]
    );
    if (result.rows.length === 0) {
      await sendSignalMessage(sender, "You haven't saved any links yet. Send me a URL to get started!");
      return;
    }
    const lines = result.rows.map((r, i) => {
      const title = r.title || new URL(r.url).hostname;
      return `${i + 1}. ${title}\n   ${r.url}`;
    });
    await sendSignalMessage(sender, `Your last ${result.rows.length} links:\n\n${lines.join('\n\n')}`);
    return;
  }

  const urlMatch = URL_REGEX.exec(text);
  if (!urlMatch) {
    await sendSignalMessage(sender,
      `Send me a URL and I'll archive it for you 🗂️\n\nCommands:\nsave <url> — save a link\nrecent — see last 5 saved links\nlogin — get a link to open the web app`
    );
    return;
  }

  const url = urlMatch[1];
  let domain;
  try { domain = new URL(url).hostname; } catch { domain = url; }

  const insert = await pool.query(
    'INSERT INTO links (user_id, url, domain, content_type, source_phone) VALUES ($1, $2, $3, $4, $5) RETURNING id',
    [userId, url, domain, 'signal', sender]
  );
  const linkId = insert.rows[0].id;

  await sendSignalMessage(sender, 'Saving… ⏳');

  try {
    await scrapeMetadata(linkId, url);
    const updated = await pool.query('SELECT title, description FROM links WHERE id = $1', [linkId]);
    const { title, description } = updated.rows[0];
    const displayTitle = title || domain;
    const reply = `Saved ✓\n\n${displayTitle}${description ? `\n${description}` : ''}\n\n🔗 ${url}`;
    await sendSignalMessage(sender, reply);
  } catch {
    await sendSignalMessage(sender, `Saved ✓\n\n🔗 ${url}`);
  }

  await invalidateUserLinks(userId);
}

export function startPolling(intervalMs = 3000) {
  if (!process.env.SIGNAL_PHONE_NUMBER) {
    console.log('[signal] SIGNAL_PHONE_NUMBER not set — polling disabled');
    return;
  }

  setInterval(async () => {
    try {
      const messages = await receiveMessages();
      for (const { sender, message } of messages) {
        await handleMessage(sender, message);
      }
    } catch (err) {
      console.error('[signal-poll] error:', err.message);
    }
  }, intervalMs);

  console.log(`[signal] polling every ${intervalMs}ms for ${process.env.SIGNAL_PHONE_NUMBER}`);
}
