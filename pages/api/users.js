import redis from '../../lib/redis';
import { verifyToken } from '../../lib/discord';
import { isBlacklisted } from '../../lib/blacklist';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.cookies.token;
  const user = verifyToken(token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    // Получаем все ключи ников (это основа списка участников)
    const keys = await redis.keys('nickname:*');
    const users = [];

    for (const key of keys) {
      const userId = key.replace('nickname:', '');
      
      const nickname = await redis.get(`nickname:${userId}`);
      const department = await redis.get(`department:${userId}`);
      const username = await redis.get(`username:${userId}`);
      const avatar = await redis.get(`avatar:${userId}`);
      const profileCustom = await redis.get(`profileCustom:${userId}`);
      const banned = await isBlacklisted(userId);

      users.push({
        userId,
        username: username || 'Без имени',
        nickname: nickname || 'Не указан',
        department: department || 'Не указан',
        avatar: avatar || '',
        profileCustom: profileCustom ? JSON.parse(profileCustom) : null,
        banned
      });
    }

    // Сортируем по нику
    users.sort((a, b) => a.nickname.localeCompare(b.nickname));

    return res.status(200).json({ users });
  } catch (error) {
    console.error('Ошибка получения участников:', error);
    return res.status(500).json({ error: 'Ошибка сервера' });
  }
}
