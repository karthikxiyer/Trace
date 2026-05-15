import Redis from 'ioredis';

// Redis is optional — if REDIS_URL is unset, all operations are no-ops
const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: 1, enableReadyCheck: false })
  : null;

if (redis) redis.on('error', err => console.error('Redis:', err.message));

export async function getCache(key) {
  if (!redis) return null;
  try {
    const val = await redis.get(key);
    return val ? JSON.parse(val) : null;
  } catch { return null; }
}

export async function setCache(key, data, ttl = 60) {
  if (!redis) return;
  try { await redis.setex(key, ttl, JSON.stringify(data)); } catch {}
}

export async function invalidateUserLinks(userId) {
  if (!redis) return;
  try {
    let cursor = '0';
    do {
      const [next, keys] = await redis.scan(cursor, 'MATCH', `links:${userId}:*`, 'COUNT', 100);
      cursor = next;
      if (keys.length) await redis.del(...keys);
    } while (cursor !== '0');
  } catch {}
}
