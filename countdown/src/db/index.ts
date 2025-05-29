import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

const client = createClient({
  url: 'libsql://REDACTED.turso.io',
  authToken: 'REDACTED_TURSO_AUTH_TOKEN',
});

export const db = drizzle(client, { schema });
