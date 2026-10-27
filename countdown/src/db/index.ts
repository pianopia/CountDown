import { drizzle, type LibSQLDatabase } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';
import { getTursoCredentials } from './turso-env';

let dbInstance: LibSQLDatabase<typeof schema> | null = null;

function getDbInstance(): LibSQLDatabase<typeof schema> {
  if (!dbInstance) {
    const { url, authToken } = getTursoCredentials();
    const client = createClient({ url, authToken });
    dbInstance = drizzle(client, { schema });
  }
  return dbInstance;
}

/** Lazily connects on first use so `next build` does not require Turso env at image build time. */
export const db = new Proxy({} as LibSQLDatabase<typeof schema>, {
  get(_target, prop, receiver) {
    return Reflect.get(getDbInstance() as object, prop, receiver);
  },
});
