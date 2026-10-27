import { loadEnvConfig } from '@next/env';
import type { Config } from 'drizzle-kit';
import { getTursoCredentials } from './src/db/turso-env';

loadEnvConfig(process.cwd());

const { url, authToken } = getTursoCredentials();

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  driver: 'turso',
  dbCredentials: {
    url,
    authToken,
  },
} satisfies Config;
