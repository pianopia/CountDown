import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  driver: 'turso',
  dbCredentials: {
    url: 'libsql://REDACTED.turso.io',
    authToken: 'REDACTED_TURSO_AUTH_TOKEN',
  },
} satisfies Config; 