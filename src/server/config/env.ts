import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CORS_ORIGIN: z.string().default('*'),
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/mandi_express?schema=public'),
  SUPABASE_URL: z.string().default('https://lchzjshajpzdvmdrzvgy.supabase.co'),
  SUPABASE_ANON_KEY: z.string().default('sb_publishable_fAJ1YiJIlQ17lUuGlpIOBQ_OzImepGx'),
  JWT_ACCESS_SECRET: z.string().default('mandi_express_super_secret_access_key_2026_!@#'),
  JWT_REFRESH_SECRET: z.string().default('mandi_express_super_secret_refresh_key_2026_!@#'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('24h'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  APP_BASE_URL: z.string().default('http://localhost:3000'),
  // WhatsApp Notification Provider Keys (Optional, logs to console in dev)
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_WHATSAPP_NUMBER: z.string().default('+14155238886'),
  WHATSAPP_API_URL: z.string().optional(),
  WHATSAPP_API_KEY: z.string().optional(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('Invalid environment variables:', _env.error.format());
  throw new Error('Invalid environment variables');
}

export const env = _env.data;
