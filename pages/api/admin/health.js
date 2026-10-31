import redis from '../../../lib/redis';
import { verifyToken } from '../../../lib/discord';
import { ADMIN_IDS } from '../../../lib/admins';

const REQUIRED_ENV = ['JWT_SECRET', 'DISCORD_CLIENT_ID', 'DISCORD_CLIENT_SECRET', 'DISCORD_REDIRECT_URI', 'REDIS_URL', 'IMGBB_API_KEY'];
const OPTIONAL_ENV = ['DISCORD_BOT_TOKEN', 'WEBHOOK_LOGS', 'WEBHOOK_BANWORDS', 'WEBHOOK_AUTOBANS', 'WEBHOOK_ADMINS', 'WEBHOOK_ERRORS', 'TESTLIK_WEBHOOK'];

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const user = verifyToken(req.cookies.token);
  if (!user || !ADMIN_IDS.includes(user.id)) return res.status(403).json({ error: 'Нет доступа' });

  const env = [];
  for (const k of REQUIRED_ENV) env.push({ key: k, set: !!process.env[k], required: true });
  for (const k of OPTIONAL_ENV) env.push({ key: k, set: !!process.env[k], required: false });

  let redisStatus = { ok: false };
  try {
    const t0 = Date.now();
    const pong = await redis.ping();
    const latency = Date.now() - t0;
    const keys = await redis.dbsize().catch(() => null);
    redisStatus = { ok: pong === 'PONG', latency, keys, error: null };
  } catch (e) { redisStatus = { ok: false, latency: null, keys: null, error: e.message }; }

  let discordStatus = { ok: false, error: null, botName: null, latency: null };
  if (!process.env.DISCORD_BOT_TOKEN) {
    discordStatus.error = 'DISCORD_BOT_TOKEN не задан';
  } else {
    try {
      const t0 = Date.now();
      const r = await fetch('https://discord.com/api/v10/users/@me', { headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` }, signal: AbortSignal.timeout(3000) });
      const latency = Date.now() - t0;
      if (r.ok) { const d = await r.json(); discordStatus = { ok: true, latency, botName: d.username, error: null }; } else { discordStatus.error = `HTTP ${r.status}`; }
    } catch (e) { discordStatus.error = e.name === 'TimeoutError' ? 'Timeout' : e.message; }
  }

  res.status(200).json({ env, redis: redisStatus, discord: discordStatus, node: process.version, env_mode: process.env.NODE_ENV, timestamp: new Date().toISOString() });
}
