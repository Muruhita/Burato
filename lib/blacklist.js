// lib/blacklist.js
import redis from './redis';

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
 * Постоянный бан — без TTL.
 * Временный — с TTL, который передаётся в addToBlacklist (по умолчанию 7 дней).
 */

const DAY = 60 * 60 * 24;

// Дефолт: ручной бан админом и автобан за банворд — 7 дней.
const DEFAULT_TTL_SECONDS = DAY * 7;

// Автобан за спам — 4 дня (см. README).
export const AUTOBAN_SPAM_TTL_SECONDS = DAY * 4;

/**
 * Добавить пользователя в чёрный список.
 *
 * @param {string} userId
 * @param {string} username
 * @param {string} reason
 * @param {boolean} permanent — бан навсегда (без TTL)
 * @param {'admin'|'autospam'|'banword'} source — источник бана
 * @param {number} ttlSeconds — срок бана (игнорируется, если permanent = true)
 */
export async function addToBlacklist(
  userId,
  username,
  reason = 'Банворд',
  permanent = false,
  source = 'admin',
  ttlSeconds = DEFAULT_TTL_SECONDS
) {
  if (!userId) throw new Error('addToBlacklist: userId is required');

  const data = JSON.stringify({
    userId: String(userId),
    username: username || 'Неизвестный',
    reason: reason || 'Без причины',
    permanent: !!permanent,
    source: source,
    timestamp: Date.now(),
  });

  const key = `blacklist:${userId}`;

  if (permanent) {
    await redis.set(key, data);
  } else {
    await redis.set(key, data, 'EX', ttlSeconds);
  }

  return true;
}

/**
 * Проверка: находится ли пользователь в чёрном списке.
 */
export async function isBlacklisted(userId) {
  if (!userId) return false;
  const banned = await redis.get(`blacklist:${userId}`);
  return !!banned;
}

/**
 * Снять бан.
 */
export async function removeFromBlacklist(userId) {
  if (!userId) return false;
  await redis.del(`blacklist:${userId}`);
  return true;
}

/**
 * Получить всех забаненных.
 * ⚠️ Использует redis.keys — на больших объёмах может блокировать Redis.
 *    Если записей станет много (>10к), заменить на SCAN.
 */
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
