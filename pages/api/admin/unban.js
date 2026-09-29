import { clearSpamLog } from '../../../lib/antispam';
import { removeFromBlacklist } from '../../../lib/blacklist';
import { verifyToken } from '../../../lib/discord';
import { ADMIN_IDS } from '../../../lib/admins';
import { logAdminAction, logError } from '../../../lib/logger';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.cookies.token;
  const user = verifyToken(token);

  if (!user || !ADMIN_IDS.includes(user.id)) {
    return res.status(403).json({ error: 'Нет доступа. Вы не являетесь администратором.' });
  }

  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'Не указан ID пользователя для разбана' });
  }

  try {
    await removeBlacklist(userId);
    await clearSpamLog(userId);

    logAdminAction({
      adminId: user.id,
      adminUsername: user.username,
      action: 'unban',
      targetId: userId,
      extra: {
        '🧹 Спам-лог': 'очищен',
        '📝 Баны': 'сняты все'
      }
    }).catch(e => console.error('[unban] admin log error:', e.message));

    return res.status(200).json({ message: `✅ Пользователь ${userId} успешно разблокирован.` });
  } catch (error) {
    console.error('Ошибка разблокировки:', error);
    logError({
      scope: 'admin:unban',
      message: error.message,
      stack: error.stack,
      userId: user.id,
      extra: { targetId: userId }
    }).catch(() => {});
    return res.status(500).json({ error: 'Ошибка при разблокировке' });
  }
}
