import { generateState } from '../../lib/discord';
import redis from '../../lib/redis';

export default async function handler(req, res) {
  const state = generateState();

  // Сохраняем state в Redis на 10 минут
  await redis.set(`oauth_state:${state}`, '1', 'EX', 600);

  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    redirect_uri: process.env.DISCORD_REDIRECT_URI || 'https://fib-bt-check-sus.vercel.app/api/auth',
    response_type: 'code',
    scope: 'identify',
    state
  });

  const discordAuthUrl = `https://discord.com/api/oauth2/authorize?${params}`;
  res.status(200).json({ url: discordAuthUrl });
}
