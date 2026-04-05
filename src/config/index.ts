import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  FIREBASE_SERVICE_ACCOUNT_KEY_PATH: z.string().optional(),
  FIREBASE_SERVICE_ACCOUNT_BASE64: z.string().optional(),
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
});

const parsedEnv = envSchema.parse(process.env);

export default {
  nodeEnv: parsedEnv.NODE_ENV,
  port: parsedEnv.PORT,
  databaseUrl: parsedEnv.DATABASE_URL,
  firebaseServiceAccountKeyPath: parsedEnv.FIREBASE_SERVICE_ACCOUNT_KEY_PATH,
  firebaseServiceAccountBase64: parsedEnv.FIREBASE_SERVICE_ACCOUNT_BASE64,
  firebaseProjectId: parsedEnv.FIREBASE_PROJECT_ID,
  firebaseClientEmail: parsedEnv.FIREBASE_CLIENT_EMAIL,
  firebasePrivateKey: parsedEnv.FIREBASE_PRIVATE_KEY,
};
