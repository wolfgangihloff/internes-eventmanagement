import 'dotenv/config';

function required(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
}

function optional(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

export const config = {
  env: optional('NODE_ENV', 'development'),
  port: Number(optional('PORT', '3000')),
  host: optional('HOST', '0.0.0.0'),

  database: {
    url: required('DATABASE_URL'),
  },

  redis: {
    url: optional('REDIS_URL', 'redis://localhost:6379'),
  },

  jwt: {
    secret: required('JWT_SECRET'),
    accessExpiresIn: Number(optional('JWT_ACCESS_EXPIRES_IN', '900')),
    refreshExpiresIn: Number(optional('JWT_REFRESH_EXPIRES_IN', '604800')),
  },

  anthropic: {
    apiKey: optional('ANTHROPIC_API_KEY', ''),
  },
} as const;
