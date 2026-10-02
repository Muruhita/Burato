// lib/antispam.js
import redis from './redis';
import { logAutoban } from './logger';
import { addToBlacklist, AUTOBAN_SPAM_TTL_SECONDS } from './blacklist';

const CONFIG = {
  MAX_ATTEMPTS: 6,
  WINDOW_SECONDS: 3600,
  COOLDOWN_SECONDS: 20,
  BAN_DURATION_LABEL: '4 дня',
};

/**
 * Проверка на спам и cooldown.
 * Возвращает:
 *   { isSpam: false, isBanned: false, attemptsLeft, timeLeft }
 *   { isSpam: true,  isBanned: true,  message } — забанен/автобан
 *   { isSpam: true,  isBanned: false, message } — cooldown
 */
export async function checkSpam(userId, username) {
  const countKey = `spam:${userId}:count`;
  const startKey = `spam:${userId}:start`;
  const lastKey = `spam:${userId}:last`;
  const banKey = `blacklist:${userId}`;
  const now = Date.now();

  // Уже в чёрном списке?
  const isBanned = await redis.get(banKey);
  if (isBanned) {
    return {
      isSpam: true,
      isBanned: true,
      message: '⛔ Вы в чёрном списке.',
    };
  }

  // Cooldown между заявками
  const lastRequest = await redis.get(lastKey);
  if (lastRequest) {
    const timeSinceLast = now - parseInt(lastRequest);
    if (timeSinceLast < CONFIG.COOLDOWN_SECONDS * 1000) {
      return {
        isSpam: true,
        isBanned: false,
        message: `⏳ Подождите ${Math.ceil((CONFIG.COOLDOWN_SECONDS * 1000 - timeSinceLast) / 1000)} сек.`,
      };
    }
  }

  let attempts = await redis.get(countKey);
  let startTime = await redis.get(startKey);

  if (!attempts || !startTime) {
    attempts = 0;
    startTime = now;
  }
  if (now - parseInt(startTime) > CONFIG.WINDOW_SECONDS * 1000) {
    attempts = 0;
    startTime = now;
  }

  attempts = parseInt(attempts) + 1;

  // Превышение лимита → автобан
  if (attempts > CONFIG.MAX_ATTEMPTS) {
    const banReason = `Превышен лимит заявок: ${CONFIG.MAX_ATTEMPTS} в час`;

    await addToBlacklist(
      userId,
      username,
      banReason,
      false,
      'autospam',
      AUTOBAN_SPAM_TTL_SECONDS   // ← явно 4 дня
    );

    await redis.del(countKey, startKey, lastKey);

    await logAutoban({
      userId,
      username: username || 'Неизвестный',
      reason: banReason,
      duration: CONFIG.BAN_DURATION_LABEL,
      source: 'autospam',
    }).catch(e => console.error('[antispam] autoban log error:', e.message));

    return {
      isSpam: true,
      isBanned: true,
      message: `⛔ Вы отправили ${CONFIG.MAX_ATTEMPTS} заявки за 1 час. Доступ заблокирован на ${CONFIG.BAN_DURATION_LABEL}.`,
    };
  }

  // Обновляем счётчики
  await redis.set(countKey, attempts, 'EX', CONFIG.WINDOW_SECONDS);
  await redis.set(startKey, startTime, 'EX', CONFIG.WINDOW_SECONDS);
  await redis.set(lastKey, now, 'EX', CONFIG.COOLDOWN_SECONDS);

  return {
    isSpam: false,
    isBanned: false,
    attemptsLeft: CONFIG.MAX_ATTEMPTS - attempts,
    timeLeft: 0,
  };
}

/**
 * Очистить лог спама пользователя.
 * Используется при разбане.
 */
export async function clearSpamLog(userId) {
  await redis.del(
    `spam:${userId}:count`,
    `spam:${userId}:start`,
    `spam:${userId}:last`
  );
  return true;
}

/**
 * Глобальный переключатель приёма заявок.
 */
export async function toggleFormSubmission(status) {
  await redis.set('forms:active', status ? 'true' : 'false');
  return status;
}

export async function isFormSubmissionActive() {
  const status = await redis.get('forms:active');
  return status === null ? true : status === 'true';
}

/**
 * Точечные переключатели отдельных форм (db, ukmb).
 */
export async function toggleFormTypeStatus(type, status) {
  await redis.set(`forms:type:${type}:active`, status ? 'true' : 'false');
  return status;
}

export async function isFormTypeActive(type) {
  const status = await redis.get(`forms:type:${type}:active`);
  return status === null ? true : status === 'true';
}

/**
 * Текущий статус лимитов пользователя.
 * Используется в /api/spam-status и на странице профиля.
 */
export async function getSpamStatus(userId) {
  const countKey = `spam:${userId}:count`;
  const startKey = `spam:${userId}:start`;
  const banKey = `blacklist:${userId}`;
  const now = Date.now();

  const isBanned = await redis.get(banKey);
  if (isBanned) return { isBanned: true, attemptsLeft: 0 };

  let attempts = await redis.get(countKey);
  let startTime = await redis.get(startKey);

  if (!attempts || !startTime) {
    return { isBanned: false, attemptsLeft: CONFIG.MAX_ATTEMPTS };
  }
  if (now - parseInt(startTime) > CONFIG.WINDOW_SECONDS * 1000) {
    return { isBanned: false, attemptsLeft: CONFIG.MAX_ATTEMPTS };
  }

  attempts = parseInt(attempts);
  return {
    isBanned: false,
    attemptsLeft: Math.max(0, CONFIG.MAX_ATTEMPTS - attempts),
  };
}
