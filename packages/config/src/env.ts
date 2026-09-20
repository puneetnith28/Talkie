import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DEMO_MODE: z
    .string()
    .transform((val) => val === 'true' || val === '1')
    .default('true'),

  // Application URLs
  APP_URL: z.string().url().default('http://localhost:3000'),
  API_URL: z.string().url().default('http://localhost:3000/api'),

  // Database & Cache
  DATABASE_URL: z.string().default('file:./dev.db'),
  REDIS_URL: z.string().optional(),

  // Clerk Authentication
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().optional(),
  CLERK_SECRET_KEY: z.string().optional(),
  CLERK_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().default('/sign-in'),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().default('/sign-up'),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: z.string().default('/dashboard'),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: z.string().default('/dashboard'),

  // Authentication & Security
  AUTH_SECRET: z.string().min(16).default('talkie_development_auth_secret_32chars_long'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // Telecom Provider
  TELEPHONY_PROVIDER: z.enum(['mock', 'twilio', 'telnyx']).default('mock'),
  TELEPHONY_ACCOUNT_ID: z.string().optional(),
  TELEPHONY_AUTH_TOKEN: z.string().optional(),
  TELEPHONY_WEBHOOK_SECRET: z.string().optional(),

  // AI & Voice Providers
  VOICE_AI_PROVIDER: z.enum(['mock', 'hosted', 'webhook']).default('mock'),
  LLM_PROVIDER: z.enum(['mock', 'openai', 'anthropic', 'groq']).default('mock'),
  LLM_API_KEY: z.string().optional(),
  STT_PROVIDER: z.enum(['mock', 'deepgram', 'whisper']).default('mock'),
  STT_API_KEY: z.string().optional(),
  TTS_PROVIDER: z.enum(['mock', 'elevenlabs', 'openai']).default('mock'),
  TTS_API_KEY: z.string().optional(),

  // Billing
  BILLING_PROVIDER: z.enum(['mock', 'stripe']).default('mock'),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Webhook Delivery Engine
  WEBHOOK_MAX_RETRIES: z.coerce.number().default(5),
  WEBHOOK_TIMEOUT_MS: z.coerce.number().default(10000),
});

export type Env = z.infer<typeof envSchema>;

let parsedEnv: Env;

export function getEnv(): Env {
  if (!parsedEnv) {
    const result = envSchema.safeParse(process.env);
    if (!result.success) {
      console.error('❌ Invalid environment variables:', result.error.format());
      // In development/test, fallback to defaults safely
      if (process.env.NODE_ENV !== 'production') {
        parsedEnv = envSchema.parse({});
      } else {
        throw new Error('Invalid environment configuration');
      }
    } else {
      parsedEnv = result.data;
    }
  }
  return parsedEnv;
}

export const env = getEnv();
