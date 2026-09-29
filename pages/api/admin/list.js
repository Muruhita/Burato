import { getAllBannedUsers } from '../../../lib/blacklist';
import { isFormSubmissionActive } from '../../../lib/antispam';
import { verifyToken } from '../../../lib/discord';
import { ADMIN_IDS } from '../../../lib/admins';

export default async function handler(req, res) {
  const token = req.cookies.token;
  const user = verifyToken(token);
  if (!user || !ADMIN_IDS.includes(user.id)) return res.status(403).json({ error: 'Нет доступа' });

  const bannedUsers = await getAllBannedUsers();
  const formsActive = await isFormSubmissionActive();
  res.status(200).json({ bannedUsers, formsActive });
}
