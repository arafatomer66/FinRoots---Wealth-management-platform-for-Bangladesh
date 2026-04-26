export const authConfig = {
  jwtSecret: process.env.JWT_SECRET || 'finroots-dev-jwt-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  saltRounds: 12,
};
