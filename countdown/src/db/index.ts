import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';
import { getTursoCredentials } from './turso-env';

const { url, authToken } = getTursoCredentials();

const client = createClient({ url, authToken });

export const db = drizzle(client, { schema });
