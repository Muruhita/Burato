// pages/api/dish.js
import redis from '../../lib/redis';
import { verifyToken } from '../../lib/discord';
import { isSafeUrl } from '../../lib/urlValidator';

const EDITOR_ID = '1018113109346504744';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const linksRaw = await redis.get('dish:links');
    const text = await redis.get('dish:text');

    let links = [];
    if (linksRaw) {
      try { links = JSON.parse(linksRaw); } catch { links = []; }
    }

    return res.status(200).json({
      links: Array.isArray(links) ? links : [],
      text: text || ''
    });
  }

  if (req.method === 'POST') {
    const token = req.cookies.token;
    const user = verifyToken(token);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    if (user.id !== EDITOR_ID) {
      return res.status(403).json({ error: 'Нет доступа. Только владелец может редактировать.' });
    }

    const { links, text } = req.body;

    // Валидация и сохранение ссылок
if (Array.isArray(links)) {
  const clean = [];
  for (const l of links) {
    const label = String(l.label || '').trim().slice(0, 120);
    const url = String(l.url || '').trim();

    if (!label || !url) continue;

    // Жёсткая проверка: только http/https, только публичные хосты.
    // Блокирует javascript:, data:, file:, приватные IP, SSRF.
    if (!isSafeUrl(url, { maxLength: 2000 })) {
      return res.status(400).json({
        error: `Недопустимая ссылка: ${label}. Разрешены только http/https с публичных хостов.`
      });
    }

    clean.push({ label, url });
  }

  if (clean.length === 0) {
    await redis.del('dish:links');
  } else {
    await redis.set('dish:links', JSON.stringify(clean));
  }
}

    // Сохранение текста
    if (typeof text === 'string') {
      if (text.trim().length === 0) await redis.del('dish:text');
      else await redis.set('dish:text', text.trim());
    }

    return res.status(200).json({ message: '✅ Сохранено' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
