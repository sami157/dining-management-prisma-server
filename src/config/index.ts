import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  FIREBASE_SERVICE_ACCOUNT_KEY_PATH: z.string().optional(),
});

const parsedEnv = envSchema.parse(process.env);

export default {
  nodeEnv: parsedEnv.NODE_ENV,
  port: parsedEnv.PORT,
  databaseUrl: parsedEnv.DATABASE_URL,
  firebaseServiceAccountKeyPath: parsedEnv.FIREBASE_SERVICE_ACCOUNT_KEY_PATH,
};
