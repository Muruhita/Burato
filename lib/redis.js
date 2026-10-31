import Redis from 'ioredis';

let redis;

if (!global._redis) {
  global._redis = new Redis(process.env.REDIS_URL, {
    // Включаем offline queue — команды будут ждать переподключения
    enableOfflineQueue: true,
    // Таймаут подключения 10 секунд
    connectTimeout: 10000,
    // Максимум 5 попыток переподключения
    retryStrategy(times) {
      if (times > 5) {
        console.error('[Redis] Превышено число попыток переподключения');
        return null;
      }
      return Math.min(times * 200, 2000);
    },
    // Keep-alive, чтобы Upstash не рвал соединение
    keepAlive: 10000,
    // Не падать при каждом запросе
    maxRetriesPerRequest: null,
    // Отключаем lazyConnect, чтобы соединение устанавливалось сразу
    lazyConnect: false,
  });
  redis = global._redis;
} else {
  redis = global._redis;
}

redis.on('connect', () => {
  console.log('[Redis] ✅ Подключено');
});

redis.on('error', (err) => {
  console.error('[Redis] ❌ Ошибка:', err.message);
});

export default redis;

/**
 * Безопасная замена redis.keys() — не блокирует Redis на больших объёмах.
 * Использовать вместо `await redis.keys('prefix:*')`.
 */
export async function scanKeys(pattern, batchSize = 200) {
  let cursor = '0';
  const keys = [];
  do {
    const [next, batch] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', batchSize);
    cursor = next;
    keys.push(...batch);
  } while (cursor !== '0');
  return keys;
}
