import { getAllBannedUsers } from '../../../lib/blacklist';
import { isFormSubmissionActive, isFormTypeActive } from '../../../lib/antispam';
import { verifyToken } from '../../../lib/discord';
import { ADMIN_IDS } from '../../../lib/admins';

export default async function handler(req, res) {
  const token = req.cookies.token;
  const user = verifyToken(token);
  if (!user || !ADMIN_IDS.includes(user.id)) {
    return res.status(403).json({ error: 'Нет доступа' });
  }

  const bannedUsers = await getAllBannedUsers();
  const formsActive = await isFormSubmissionActive();

  const formTypes = {
    db: await isFormTypeActive('db'),
    ukmb: await isFormTypeActive('ukmb'),
  };

  res.status(200).json({ bannedUsers, formsActive, formTypes });
}
