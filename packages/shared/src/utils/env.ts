import { z } from 'zod';

const EnvSchema = z.object({
  VITE_API_URL: z.string().default('http://localhost:5000/api/v1'),
  VITE_SOCKET_URL: z.string().default('http://localhost:5000'),
  VITE_USE_MOCKS: z
    .string()
    .transform((val) => val === 'true' || val === '1')
    .default('true'),
  VITE_SENTRY_DSN: z.string().optional(),
  VITE_APP_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  VITE_FIREBASE_VAPID_KEY: z.string().optional(),
});

export type AppEnv = z.infer<typeof EnvSchema>;

export function getAppEnv(): AppEnv {
  const metaEnv = ((import.meta as any).env || {}) as Record<string, string | undefined>;
  const rawEnv = {
    VITE_API_URL: metaEnv.VITE_API_URL,
    VITE_SOCKET_URL: metaEnv.VITE_SOCKET_URL,
    VITE_USE_MOCKS: metaEnv.VITE_USE_MOCKS,
    VITE_SENTRY_DSN: metaEnv.VITE_SENTRY_DSN,
    VITE_APP_ENV: metaEnv.VITE_APP_ENV,
    VITE_FIREBASE_VAPID_KEY: metaEnv.VITE_FIREBASE_VAPID_KEY,
  };

  const parsed = EnvSchema.safeParse(rawEnv);
  if (!parsed.success) {
    console.warn(
      '⚠️ [QueueSmart Env Helper] Some environment variables have invalid formats or are missing:',
      parsed.error.format()
    );
    // Return sensible fallback defaults
    return {
      VITE_API_URL: 'http://localhost:5000/api/v1',
      VITE_SOCKET_URL: 'http://localhost:5000',
      VITE_USE_MOCKS: true,
      VITE_APP_ENV: 'development',
    };
  }

  return parsed.data;
}

export const env = getAppEnv();
