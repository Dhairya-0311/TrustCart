import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  // Server
  PORT: z.string().default('4000').transform(Number),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),

  // Auth
  JWT_SECRET: z.string().min(10, 'JWT_SECRET must be at least 10 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid connection string'),

  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // AI — Google Gemini
  GOOGLE_API_KEY: z.string().optional().default(''),
  AI_MODEL: z.string().default('gemini-2.0-flash'),

  // Scraping
  SCRAPER_TIMEOUT_MS: z.string().default('30000').transform(Number),
  PROXY_URL: z.string().optional().default(''),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().default('900000').transform(Number),
  RATE_LIMIT_MAX_FREE: z.string().default('10').transform(Number),
  RATE_LIMIT_MAX_PRO: z.string().default('100').transform(Number),
});

function validateEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
  }

  return parsed.data;
}

export const env = validateEnv();
export type Env = z.infer<typeof envSchema>;
