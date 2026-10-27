import { config } from 'dotenv';
import { resolve } from 'path';

function loadDotenvIfNeeded(): void {
  if (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) {
    return;
  }
  if (process.env.NODE_ENV === 'production') {
    return;
  }
  const projectRoot = resolve(process.cwd());
  config({ path: resolve(projectRoot, '.env') });
  config({ path: resolve(projectRoot, '.env.local') });
}

loadDotenvIfNeeded();

export function getTursoCredentials(): { url: string; authToken: string } {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    const missing = [
      !url && 'TURSO_DATABASE_URL',
      !authToken && 'TURSO_AUTH_TOKEN',
    ].filter(Boolean);

    const message =
      `Missing required Turso configuration: ${missing.join(', ')}. ` +
      'Set these environment variables in your deployment platform or in a local .env file (see .env.example).';

    throw new Error(message);
  }

  return { url, authToken };
}
