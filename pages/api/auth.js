import { getDiscordToken, getDiscordUser, createToken } from '../../lib/discord';
import redis from '../../lib/redis';

export default async function handler(req, res) {
  const { code, error, state } = req.query;

  if (error) return res.redirect('/?error=access_denied');
  if (!code) return res.redirect('/?error=no_code');

  const isLocal = process.env.NODE_ENV === 'development';
  const secureFlag = isLocal ? '' : '; Secure';
  const clearStateCookie = `oauth_state=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secureFlag}`;

  // ── CSRF-защита ──────────────────────────────────────────
  // 1) state должен быть в URL
  // 2) он должен совпадать с cookie, которую МЫ поставили в start-auth
  //    (иначе атакующий мог бы подсунуть жертве чужой code+state)
  const cookieState = req.cookies.oauth_state;
  if (!state || !cookieState || state !== cookieState) {
    console.warn('[auth] CSRF check failed (cookie/state mismatch)');
    res.setHeader('Set-Cookie', clearStateCookie);
    return res.redirect('/?error=invalid_state');
  }

  // 3) state должен быть валидным в Redis
  const stateKey = `oauth_state:${state}`;
  const savedState = await redis.get(stateKey);
  if (!savedState || savedState !== '1') {
    res.setHeader('Set-Cookie', clearStateCookie);
    return res.redirect('/?error=invalid_state');
  }
  await redis.del(stateKey);

  try {
    const tokenData = await getDiscordToken(code);
    const user = await getDiscordUser(tokenData.access_token);
    const jwtToken = createToken(user);

    await redis.set(`username:${user.id}`, user.username);
    if (user.avatar) {
      await redis.set(`avatar:${user.id}`, user.avatar);
    }

    // Двумя Set-Cookie: гасим oauth_state, ставим token
    res.setHeader('Set-Cookie', [
      clearStateCookie,
      `token=${jwtToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400${secureFlag}`,
    ]);
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Auth error:', error);
    res.setHeader('Set-Cookie', clearStateCookie);
    res.redirect('/?error=auth_failed');
  }
}
