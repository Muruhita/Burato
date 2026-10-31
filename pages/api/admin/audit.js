import redis from '../../../lib/redis';
import { verifyToken } from '../../../lib/discord';
import { ADMIN_IDS } from '../../../lib/admins';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const user = verifyToken(req.cookies.token);
  if (!user || !ADMIN_IDS.includes(user.id)) return res.status(403).json({ error: 'Нет доступа' });

  const limit = Math.min(parseInt(req.query.limit) || 200, 1000);
  try {
    const raw = await redis.zrevrange('admin:audit', 0, limit - 1);
    const items = raw.map(r => { try { return JSON.parse(r); } catch { return null; } }).filter(Boolean);
    res.status(200).json({ items });
  } catch (e) {
    console.error('[audit] error:', e.message);
    res.status(500).json({ error: 'Ошибка чтения аудита' });
  }
}
