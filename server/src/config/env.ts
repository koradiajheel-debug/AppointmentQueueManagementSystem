import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const ServerEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),

  // Database (PostgreSQL - Neon / Supabase)
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/queuesmart?schema=public'),
  DIRECT_URL: z.string().optional(),

  // Redis Cache & Socket Adapter (Upstash or local)
  REDIS_URL: z.string().optional(), // If missing, in-memory simulator activates

  // JWT Security
  JWT_ACCESS_SECRET: z.string().min(16).default('queuesmart_super_secure_access_jwt_secret_2026_xyz!'),
  JWT_REFRESH_SECRET: z.string().min(16).default('queuesmart_super_secure_refresh_jwt_secret_2026_abc!'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // CORS Portals
  CUSTOMER_URL: z.string().default('http://localhost:3000'),
  ADMIN_URL: z.string().default('http://localhost:3001'),

  // Notifications Dispatcher Mode (MOCK, TWILIO, MSG91, RESEND, SMTP)
  NOTIFICATIONS_MODE: z.enum(['MOCK', 'TWILIO', 'MSG91', 'RESEND', 'SMTP']).default('MOCK'),

  // SMS Gateway: Twilio
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_FROM_PHONE: z.string().optional(),

  // SMS Gateway: MSG91
  MSG91_AUTH_KEY: z.string().optional(),
  MSG91_SENDER_ID: z.string().optional(),
  MSG91_TEMPLATE_ID: z.string().optional(),

  // Email Gateway: Resend or SMTP
  RESEND_API_KEY: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().default('notifications@queuesmart.dev'),

  // Push Notifications: Firebase Cloud Messaging
  FCM_SERVER_KEY: z.string().optional(),
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),

  // Maps & Geolocation API (Google Maps or OpenRouteService)
  MAPS_PROVIDER: z.enum(['MOCK', 'GOOGLE', 'ORS']).default('MOCK'),
  GOOGLE_MAPS_API_KEY: z.string().optional(),
  OPENROUTESERVICE_API_KEY: z.string().optional(),

  // Error Tracking: Sentry
  SENTRY_DSN: z.string().optional(),
});

export type ServerEnv = z.infer<typeof ServerEnvSchema>;

function validateEnv(): ServerEnv {
  const result = ServerEnvSchema.safeParse(process.cwd() ? process.env : {});
  if (!result.success) {
    console.error('❌ [FATAL] Environment validation failed. Required variables are missing or misconfigured:');
    console.error(JSON.stringify(result.error.format(), null, 2));
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    // In development, return parsed with fallbacks
    return ServerEnvSchema.parse({});
  }
  return result.data;
}

export const env = validateEnv();
