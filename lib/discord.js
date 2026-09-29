import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Генерация state для защиты от CSRF
export function generateState() {
  return crypto.randomBytes(32).toString('hex');
}

// Получение токена Discord (с поддержкой PKCE)
export async function getDiscordToken(code, codeVerifier) {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('Discord credentials not configured');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'authorization_code',
    code,
    redirect_uri: process.env.DISCORD_REDIRECT_URI || 'https://fib-bt-forms.vercel.app/api/auth',
    scope: 'identify'
  });

  if (codeVerifier) {
    params.append('code_verifier', codeVerifier);
  }

  const response = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get token: ${errorText}`);
  }

  return response.json();
}

export async function getDiscordUser(accessToken) {
  const response = await fetch('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    throw new Error('Failed to get user');
  }

  return response.json();
}

// Создание JWT токена
export function createToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set');
  }
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      avatar: user.avatar,
      discriminator: user.discriminator || '0'
    },
    secret,
    { expiresIn: '24h' }
  );
}

// Верификация JWT — без TEST_AUTH_BYPASS, строго через секрет
export function verifyToken(token) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return null;
  }
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
}
