import { generateState } from '../../lib/discord';
import redis from '../../lib/redis';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const state = generateState();

  // Храним state на сервере — валидация "не выдуман ли он"
  await redis.set(`oauth_state:${state}`, '1', 'EX', 600);

  // CSRF: привязываем state к этому браузеру через httpOnly-cookie.
  // Lax (не Strict) — иначе cookie не отправится на redirect с discord.com.
  const isLocal = process.env.NODE_ENV === 'development';
  const secureFlag = isLocal ? '' : '; Secure';
  res.setHeader(
    'Set-Cookie',
    `oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600${secureFlag}`
  );

  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
redirect_uri: (() => {
  const uri = process.env.DISCORD_REDIRECT_URI;
  if (!uri) throw new Error('DISCORD_REDIRECT_URI is not set');
  return uri;
})(),
    response_type: 'code',
    scope: 'identify',
    state
  });

  const discordAuthUrl = `https://discord.com/api/oauth2/authorize?${params}`;
  res.status(200).json({ url: discordAuthUrl });
}
