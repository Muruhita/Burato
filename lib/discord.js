export function verifyToken(token) {
  // 🧪 Только для Preview/локальной разработки.
  // Включается переменной TEST_AUTH_BYPASS=true. В Production её быть не должно.
  if (process.env.TEST_AUTH_BYPASS === 'true') {
    return {
      id: process.env.TEST_AUTH_USER_ID || '1018113109346504744',
      username: process.env.TEST_AUTH_USERNAME || 'TestUser',
      avatar: null,
      discriminator: '0',
    };
  }

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
