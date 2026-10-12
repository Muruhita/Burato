import { isFormTypeActive } from '../../lib/antispam';

const TOGGLEABLE = ['db', 'ukmb'];

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const result = {};
    for (const key of TOGGLEABLE) {
      result[key] = await isFormTypeActive(key);
    }
    res.status(200).json({ forms: result });
  } catch (e) {
    console.error('[forms-status] error:', e.message);
    // при сбое — считаем всё включённым (fail-open)
    const fallback = {};
    for (const key of TOGGLEABLE) fallback[key] = true;
    res.status(200).json({ forms: fallback });
  }
}
