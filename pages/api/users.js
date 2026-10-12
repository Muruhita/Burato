import redis from '../../lib/redis';
import { verifyToken } from '../../lib/discord';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.cookies.token;
  const user = verifyToken(token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const keys = await redis.keys('nickname:*');
    if (!keys.length) return res.status(200).json({ users: [] });

    const userIds = keys.map(k => k.replace('nickname:', ''));

    // ── Один pipeline на все данные ──
    const pipeline = redis.pipeline();
    for (const id of userIds) {
      pipeline.get(`nickname:${id}`);
      pipeline.get(`department:${id}`);
      pipeline.get(`username:${id}`);
      pipeline.get(`avatar:${id}`);
      pipeline.get(`profileCustom:${id}`);
      pipeline.exists(`blacklist:${id}`);
    }
    const results = await pipeline.exec();

    const CHUNK = 6;
    const users = [];

    for (let i = 0; i < userIds.length; i++) {
      const base = i * CHUNK;
      const [
        , // nickname — [err, val]
      ] = [];

      const nickname      = results[base + 0]?.[1] || null;
      const department    = results[base + 1]?.[1] || null;
      const username      = results[base + 2]?.[1] || null;
      const avatar        = results[base + 3]?.[1] || null;
      const profileCustom = results[base + 4]?.[1] || null;
      const bannedFlag    = results[base + 5]?.[1] || 0;

      let parsedCustom = null;
      if (profileCustom) {
        try { parsedCustom = JSON.parse(profileCustom); } catch {}
      }

      users.push({
        userId: userIds[i],
        username: username || 'Без имени',
        nickname: nickname || 'Не указан',
        department: department || 'Не указан',
        avatar: avatar || '',
        profileCustom: parsedCustom,
        banned: !!bannedFlag,
      });
    }

    users.sort((a, b) => a.nickname.localeCompare(b.nickname));

    return res.status(200).json({ users });
  } catch (error) {
    console.error('Ошибка получения участников:', error);
    return res.status(500).json({ error: 'Ошибка сервера' });
  }
}
