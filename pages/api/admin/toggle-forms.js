import { toggleFormSubmission } from '../../../lib/antispam';
import { verifyToken } from '../../../lib/discord';
import { ADMIN_IDS } from '../../../lib/admins';
import { logAdminAction, logError } from '../../../lib/logger';

export default async function handler(req, res) {
  const token = req.cookies.token;
  const user = verifyToken(token);
  if (!user || !ADMIN_IDS.includes(user.id)) return res.status(403).json({ error: 'Нет доступа' });

  const { status } = req.body;

  try {
    const newStatus = await toggleFormSubmission(status);

    logAdminAction({
      adminId: user.id,
      adminUsername: user.username,
      action: newStatus ? 'toggle_forms_on' : 'toggle_forms_off',
      extra: {
        '📋 Новый статус': newStatus ? '🟢 Заявки открыты' : '🔴 Заявки остановлены'
      }
    }).catch(e => console.error('[toggle-forms] admin log error:', e.message));

    res.status(200).json({ formsActive: newStatus });
  } catch (error) {
    logError({
      scope: 'admin:toggle-forms',
      message: error.message,
      stack: error.stack,
      userId: user.id
    }).catch(() => {});
    res.status(500).json({ error: 'Ошибка изменения статуса' });
  }
}
