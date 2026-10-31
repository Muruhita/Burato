import redis, { scanKeys } from '../../../lib/redis';
import { verifyToken } from '../../../lib/discord';
import { ADMIN_IDS } from '../../../lib/admins';

// Извлекаем статик из ника: последнее число из 4–8 цифр
function extractStatic(nickname) {
  if (!nickname) return null;
  const match = String(nickname).match(/(\d{4,8})\s*$/);
  return match ? match[1] : null;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const token = req.cookies.token;
  const user = verifyToken(token);
  if (!user || !ADMIN_IDS.includes(user.id)) {
    return res.status(403).json({ error: 'Нет доступа' });
  }

  try {
    const keys = await scanKeys('nickname:*');
    if (!keys.length) return res.status(200).json({ duplicates: [] });

    const userIds = keys.map(k => k.replace('nickname:', ''));

    const pipeline = redis.pipeline();
    for (const id of userIds) {
      pipeline.get(`nickname:${id}`);
      pipeline.get(`username:${id}`);
      pipeline.get(`department:${id}`);
      pipeline.exists(`blacklist:${id}`);
    }
    const results = await pipeline.exec();

    const CHUNK = 4;
    const users = [];

    for (let i = 0; i < userIds.length; i++) {
      const base = i * CHUNK;
      const nickname = results[base]?.[1] || '';
      const username = results[base + 1]?.[1] || '';
      const department = results[base + 2]?.[1] || '';
      const banned = !!results[base + 3]?.[1];
      const staticId = extractStatic(nickname);
      if (staticId) {
        users.push({ userId: userIds[i], nickname, username, department, staticId, banned });
      }
    }

    // Группируем по статику
    const byStatic = {};
    users.forEach(u => {
      if (!byStatic[u.staticId]) byStatic[u.staticId] = [];
      byStatic[u.staticId].push(u);
    });

    // Оставляем группы с >1 юзером
    const duplicates = Object.entries(byStatic)
      .filter(([, arr]) => arr.length > 1)
      .map(([staticId, arr]) => ({
        staticId,
        users: arr.sort((a, b) => (a.username || '').localeCompare(b.username || ''))
      }))
      .sort((a, b) => b.users.length - a.users.length);

    return res.status(200).json({ duplicates, totalUsers: users.length });
  } catch (e) {
    console.error('[duplicates] error:', e.message);
    return res.status(500).json({ error: 'Ошибка сервера' });
  }
}
