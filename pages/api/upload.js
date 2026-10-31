import redis from '../../lib/redis';
import { verifyToken } from '../../lib/discord';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 🔒 Только авторизованные
  const token = req.cookies.token;
  const user = verifyToken(token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

    // 🔒 Rate-limit: не больше 10 загрузок в минуту на пользователя.
  // Защищает ImgBB-ключ от спама / случайного бана аккаунта.
  const RATE_LIMIT = 15;
  const RATE_WINDOW = 60; // сек
  try {
    const rlKey = `upload:rate:${user.id}`;
    const count = await redis.incr(rlKey);
    if (count === 1) {
      await redis.expire(rlKey, RATE_WINDOW);
    }
    if (count > RATE_LIMIT) {
      const ttl = await redis.ttl(rlKey);
      return res.status(429).json({
        error: `Слишком много загрузок. Подождите ${Math.max(1, ttl)} сек.`,
      });
    }
  } catch (e) {
    // Если Redis недоступен — не блокируем пользователя (fail-open).
    console.error('[upload] rate-limit error:', e.message);
  }

  const apiKey = process.env.IMGBB_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'IMGBB_API_KEY не настроен' });
  }

  try {
    const { image } = req.body || {};
    if (!image) {
      return res.status(400).json({ error: 'Нет изображения' });
    }

    // Убираем data:image/...;base64,
    const base64 = image.replace(/^data:.*?;base64,/, '');

    // ~5 МБ лимит
    if (base64.length > 7 * 1024 * 1024) {
      return res.status(413).json({ error: 'Файл больше 5 МБ' });
    }

    const formData = new FormData();
    formData.append('key', apiKey);
    formData.append('image', base64);

    const imgbbRes = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: formData
    });

    const data = await imgbbRes.json();

    if (!imgbbRes.ok || !data.success) {
      console.error('[imgbb] ошибка:', imgbbRes.status, data);
      return res.status(imgbbRes.status).json({
        error: data?.error?.message || 'Ошибка imgbb',
        imgbbStatus: imgbbRes.status,
        imgbbBody: data
      });
    }

    // deleteUrl и id клиенту не нужны: удаление через фронт не поддерживается,
    // внутренний ID imgbb тоже бесполезен для пользователя.
    // Оставляем только публичные поля.
    return res.status(200).json({
      url: data.data.url,
      displayUrl: data.data.display_url,
    });
  } catch (error) {
    console.error('[upload] ошибка:', error);
    return res.status(500).json({ error: error.message || 'Ошибка загрузки' });
  }
}
