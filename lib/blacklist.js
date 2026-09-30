import redis from './redis';
import { ADMIN_IDS } from './admins';

/**
 * Формат записи в Redis (ключ blacklist:${userId}):
 * {
 *   userId: string,
 *   username: string,
 *   reason: string,
 *   permanent: boolean,
 *   source: 'admin' | 'autospam' | 'banword',
 *   timestamp: number
 * }
 *
 * Постоянный бан — без TTL. Временный — с TTL 7 дней.
 */

const TTL_SECONDS = 60 * 60 * 24 * 4; // 7 дней

export async function addToBlacklist(userId, username, reason = 'Банворд', permanent = false, source = 'admin') {
  if (!userId) throw new Error('addToBlacklist: userId is required');

  const data = JSON.stringify({
    userId: String(userId),
    username: username || 'Неизвестный',
    reason: reason || 'Без причины',
    permanent: !!permanent,
    source: source,            // ← теперь берётся из аргумента
    timestamp: Date.now(),
  });
  // ... остальное без изменений

  const key = `blacklist:${userId}`;

  if (permanent) {
    await redis.set(key, data);
  } else {
    await redis.set(key, data, 'EX', TTL_SECONDS);
  }

  return true;
}

export async function isBlacklisted(userId) {
  if (!userId) return false;
  const banned = await redis.get(`blacklist:${userId}`);
  return !!banned;
}

export async function removeFromBlacklist(userId) {
  if (!userId) return false;
  await redis.del(`blacklist:${userId}`);
  return true;
}

export async function getAllBannedUsers() {
  const keys = await redis.keys('blacklist:*');
  const users = [];

  for (const key of keys) {
    const data = await redis.get(key);
    if (!data) continue;

    let parsed = null;
    try {
      parsed = JSON.parse(data);
    } catch {
      // старый формат — просто строка с причиной
    }

    const userId = key.replace('blacklist:', '');

    if (parsed) {
      users.push({
        userId,
        username: parsed.username || null,
        reason: parsed.reason || 'Без причины',
        permanent: !!parsed.permanent,
        timestamp: parsed.timestamp || null,
        source: parsed.source || 'unknown',
      });
    } else {
      users.push({
        userId,
        username: null,
        reason: data,
        permanent: false,
        timestamp: null,
        source: 'legacy',
      });
    }
  }

  return users;
}

export function isAdmin(userId) {
  if (!userId) return false;
  return ADMIN_IDS.includes(String(userId));
}
