import redis from '../../lib/redis';
import { verifyToken } from '../../lib/discord';
import { containsBadWords } from '../../lib/badwords';
import { getBanInfo } from '../../lib/ban-utils';
import { isValidRank } from '../../lib/ranks';
import { isSafeUrl, TRUSTED_IMAGE_HOSTS } from '../../lib/urlValidator';
import { isValidDepartment } from '../../lib/departments';

const ALLOWED_PRESETS = ['default', 'blue', 'purple', 'green'];
const MAX_URL_LENGTH = 500;

function validateCustom(custom) {
  if (!custom || typeof custom !== 'object') return null;

  if (custom.type === 'preset') {
    const id = String(custom.presetId || '');
    if (!ALLOWED_PRESETS.includes(id)) return null;
    return { type: 'preset', presetId: id };
  }

  if (custom.type === 'image') {
    const url = String(custom.url || '').trim();
    if (!url || url.length > MAX_URL_LENGTH) return null;

    // Whitelist: только доверенные хостеры (imgbb, imgur, Discord CDN,
    // Google Drive, Yandex Disk, GitHub, Cloudinary, Pinterest и т.д.).
    // Это блокирует tracking-pixel через evil.com, SSRF на приватные IP,
    // javascript:/data:/file: схемы и прочее.
    const safe = isSafeUrl(url, {
      maxLength: MAX_URL_LENGTH,
      allowedHosts: TRUSTED_IMAGE_HOSTS,
    });
    if (!safe) return null;

    return { type: 'image', url };
  }

  return null;
}

export default async function handler(req, res) {
  const token = req.cookies.token;
  const user = verifyToken(token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    const [nickname, department, rank, profileCustomRaw] = await Promise.all([
      redis.get(`nickname:${user.id}`),
      redis.get(`department:${user.id}`),
      redis.get(`rank:${user.id}`),
      redis.get(`profileCustom:${user.id}`),
    ]);
    const { banned, reason: banReason, until: banUntil } = await getBanInfo(user.id);

    let profileCustom = null;
    if (profileCustomRaw) {
      try { profileCustom = JSON.parse(profileCustomRaw); } catch {}
    }

    return res.status(200).json({
      user,
      nickname,
      department,
      rank,
      profileCustom,
      banned,
      banReason,
      banUntil
    });
  }

  if (req.method === 'POST') {
    const { nickname, department, rank, profileCustom } = req.body;

    if (nickname !== undefined) {
      if (!nickname || containsBadWords(nickname)) {
        return res.status(400).json({ error: 'Никнейм содержит запрещенные слова!' });
      }
      await redis.set(`nickname:${user.id}`, nickname);
    }

    if (department !== undefined) {
      if (department === '' || department === null) {
        await redis.del(`department:${user.id}`);
      } else if (!isValidDepartment(department)) {
        return res.status(400).json({ error: 'Некорректный отдел' });
      } else {
        await redis.set(`department:${user.id}`, String(department));
      }
    }

    if (rank !== undefined) {
      if (rank === '' || rank === null) {
        await redis.del(`rank:${user.id}`);
      } else if (!isValidRank(rank)) {
        return res.status(400).json({ error: 'Некорректный ранг' });
      } else {
        await redis.set(`rank:${user.id}`, String(rank));
      }
    }

    if (profileCustom !== undefined) {
      if (profileCustom === null) {
        await redis.del(`profileCustom:${user.id}`);
      } else {
        const clean = validateCustom(profileCustom);
        if (!clean) {
          return res.status(400).json({ error: 'Некорректные данные кастомизации' });
        }
        await redis.set(`profileCustom:${user.id}`, JSON.stringify(clean));
      }
    }

    return res.status(200).json({ message: 'Профиль обновлён!' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
