import { isFormTypeActive } from '../../lib/antispam';

const ALL_FORMS = [
  'promotion', 'transfer', 'report', 'highrank', 'resignation', 
  'reinstatement', 'transferToFib', 'weaponRequest', 'withdrawal', 
  'hiring', 'claim', 'leave', 'db', 'ukmb', 'exam'
];

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const result = {};
    for (const key of ALL_FORMS) {
      result[key] = await isFormTypeActive(key);
    }
    res.status(200).json({ forms: result });
  } catch (e) {
    const fallback = {};
    for (const key of ALL_FORMS) fallback[key] = true;
    res.status(200).json({ forms: fallback });
  }
}
