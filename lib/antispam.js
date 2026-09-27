import redis from './redis';
import { logAutoban } from './logger';

const CONFIG = {
  MAX_ATTEMPTS: 6,
  WINDOW_SECONDS: 3600,
  COOLDOWN_SECONDS: 20,
  BAN_DURATION: 60 * 60 * 24 * 3
};

export async function checkSpam(userId, username) {
  const countKey = `spam:${userId}:count`;
  const startKey = `spam:${userId}:start`;
  const lastKey = `spam:${userId}:last`;
  const banKey = `blacklist:${userId}`;
  const now = Date.now();

  const isBanned = await redis.get(banKey);
  if (isBanned) return { isSpam: true, isBanned: true, message: '⛔ Вы в чёрном списке.' };

  const lastRequest = await redis.get(lastKey);
  if (lastRequest) {
    const timeSinceLast = now - parseInt(lastRequest);
    if (timeSinceLast < CONFIG.COOLDOWN_SECONDS * 1000) {
      return {
        isSpam: true,
        isBanned: false,
        message: `⏳ Подождите ${Math.ceil((CONFIG.COOLDOWN_SECONDS * 1000 - timeSinceLast) / 1000)} сек.`
      };
    }
  }

  let attempts = await redis.get(countKey);
  let startTime = await redis.get(startKey);

  if (!attempts || !startTime) { attempts = 0; startTime = now; }
  if (now - parseInt(startTime) > CONFIG.WINDOW_SECONDS * 1000) { attempts = 0; startTime = now; }

  attempts = parseInt(attempts) + 1;

  if (attempts > CONFIG.MAX_ATTEMPTS) {
    const banReason = `Превышен лимит заявок: ${CONFIG.MAX_ATTEMPTS} в час. Автобан на 7 дней.`;
    const banData = JSON.stringify({
      username: username || 'Неизвестный',
      reason: banReason,
      timestamp: Date.now(),
      permanent: false,
      source: 'autospam'
    });
    await redis.set(banKey, banData, 'EX', CONFIG.BAN_DURATION);
    await redis.del(countKey, startKey, lastKey);

    // 📢 Лог автобана
    await logAutoban({
      userId,
      username: username || 'Неизвестный',
      reason: `Превышен лимит: ${CONFIG.MAX_ATTEMPTS} заявок/час`,
      duration: '7 дней',
      source: 'autospam'
    }).catch(e => console.error('[antispam] autoban log error:', e.message));

    return {
      isSpam: true,
      isBanned: true,
      message: `⛔ Вы отправили ${CONFIG.MAX_ATTEMPTS} заявки за 1 час. Доступ заблокирован на 7 дней.`
    };
  }

  await redis.set(countKey, attempts, 'EX', CONFIG.WINDOW_SECONDS);
  await redis.set(startKey, startTime, 'EX', CONFIG.WINDOW_SECONDS);
  await redis.set(lastKey, now, 'EX', CONFIG.COOLDOWN_SECONDS);

  return { isSpam: false, isBanned: false, attemptsLeft: CONFIG.MAX_ATTEMPTS - attempts, timeLeft: 0 };
}

export async function getAllBannedUsers() {
  const keys = await redis.keys('blacklist:*');
  const users = [];
  for (const key of keys) {
    const data = await redis.get(key);
    if (!data) continue;

    let reason = data;
    let username = null;
    let timestamp = null;
    let permanent = false;

    try {
      const parsed = JSON.parse(data);
      reason = parsed.reason || data;
      username = parsed.username || null;
      timestamp = parsed.timestamp || null;
      permanent = !!parsed.permanent;
    } catch {
      // старый формат
    }

    users.push({
      userId: key.replace('blacklist:', ''),
      reason,
      username,
      timestamp,
      permanent
    });
  }
  return users;
}

export async function clearSpamLog(userId) {
  await redis.del(`spam:${userId}:count`, `spam:${userId}:start`, `spam:${userId}:last`);
  return true;
}

export async function removeBlacklist(userId) {
  await redis.del(`blacklist:${userId}`);
  return true;
}

export async function isBlacklisted(userId) {
  const banned = await redis.get(`blacklist:${userId}`);
  return !!banned;
}

export async function toggleFormSubmission(status) {
  await redis.set('forms:active', status ? 'true' : 'false');
  return status;
}

export async function isFormSubmissionActive() {
  const status = await redis.get('forms:active');
  return status === null ? true : status === 'true';
}

export async function getSpamStatus(userId) {
  const countKey = `spam:${userId}:count`;
  const startKey = `spam:${userId}:start`;
  const banKey = `blacklist:${userId}`;
  const now = Date.now();

  const isBanned = await redis.get(banKey);
  if (isBanned) return { isBanned: true, attemptsLeft: 0 };

  let attempts = await redis.get(countKey);
  let startTime = await redis.get(startKey);

  if (!attempts || !startTime) return { isBanned: false, attemptsLeft: CONFIG.MAX_ATTEMPTS };
  if (now - parseInt(startTime) > CONFIG.WINDOW_SECONDS * 1000) {
    return { isBanned: false, attemptsLeft: CONFIG.MAX_ATTEMPTS };
  }

  attempts = parseInt(attempts);
  return { isBanned: false, attemptsLeft: Math.max(0, CONFIG.MAX_ATTEMPTS - attempts) };
}

export async function cleanupDeadTickets() {
  const ids = await redis.zrange('support:tickets', 0, -1);
  if (!ids.length) return { cleaned: 0, total: 0 };

  const deadIds = [];
  const pipeline = redis.pipeline();
  ids.forEach(id => pipeline.exists(`support:ticket:${id}`));
  const results = await pipeline.exec();

  results.forEach(([err, exists], i) => {
    if (!err && !exists) deadIds.push(ids[i]);
  });

  if (deadIds.length) {
    await redis.zrem('support:tickets', ...deadIds);
  }

  return { cleaned: deadIds.length, total: ids.length };
}

export async function clearAllTickets() {
  const ids = await redis.zrange('support:tickets', 0, -1);
  if (!ids.length) return { deleted: 0 };

  const ticketKeys = ids.map(id => `support:ticket:${id}`);

  const pipeline = redis.pipeline();
  ticketKeys.forEach(key => pipeline.del(key));
  pipeline.del('support:tickets');
  pipeline.del('support:unread:admin');
  await pipeline.exec();

  const unreadKeys = await redis.keys('support:unread:*');
  if (unreadKeys.length) {
    const cleanPipeline = redis.pipeline();
    unreadKeys.forEach(key => cleanPipeline.del(key));
    await cleanPipeline.exec();
  }

  return { deleted: ids.length };
}

export async function toggleFormTypeStatus(type, status) {
  await redis.set(`forms:type:${type}:active`, status ? 'true' : 'false');
  return status;
}
