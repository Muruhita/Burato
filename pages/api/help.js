import redis from '../../lib/redis';
import { verifyToken } from '../../lib/discord';
import { ADMIN_IDS } from '../../lib/admins';

export default async function handler(req, res) {
  const token = req.cookies.token;
  const user = verifyToken(token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    const content = await redis.get('help:content');
    return res.status(200).json({ content: content || 'Информация пока не заполнена.' });
  }

  if (req.method === 'POST') {
    if (!ADMIN_IDS.includes(user.id)) return res.status(403).json({ error: 'Нет доступа' });
    const { content } = req.body;
    if (typeof content !== 'string') {
      return res.status(400).json({ error: 'Неверные данные' });
    }
    await redis.set('help:content', content);
    return res.status(200).json({ message: 'Справка обновлена!' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
