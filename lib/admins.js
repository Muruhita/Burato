// lib/admins.js
const DEFAULT_ADMIN_IDS = [
  '1018113109346504744',
  '555380718566506506',
  '260076815970729985',
  '797111731864207360'
];

function parseAdminIds() {
  const env = process.env.ADMIN_IDS;
  if (!env || typeof env !== 'string') return DEFAULT_ADMIN_IDS;
  const parsed = env.split(',').map(s => s.trim()).filter(Boolean);
  return parsed.length > 0 ? parsed : DEFAULT_ADMIN_IDS;
}

export const ADMIN_IDS = parseAdminIds();

export function isAdmin(userId) {
  if (!userId) return false;
  return ADMIN_IDS.includes(String(userId));
}

export default ADMIN_IDS;
