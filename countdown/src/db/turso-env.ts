const TURSO_DATABASE_URL_VAR = 'TURSO_DATABASE_URL';
const TURSO_AUTH_TOKEN_VAR = 'TURSO_AUTH_TOKEN';

export type TursoCredentials = {
  url: string;
  authToken: string;
};

/**
 * Returns Turso connection settings from the environment.
 * Throws with a clear message if any required variable is missing or empty.
 */
export function getTursoCredentials(): TursoCredentials {
  const url = process.env[TURSO_DATABASE_URL_VAR]?.trim();
  const authToken = process.env[TURSO_AUTH_TOKEN_VAR]?.trim();

  const missing: string[] = [];
  if (!url) missing.push(TURSO_DATABASE_URL_VAR);
  if (!authToken) missing.push(TURSO_AUTH_TOKEN_VAR);

  if (missing.length > 0) {
    throw new Error(
      `Missing required Turso environment variable(s): ${missing.join(', ')}. ` +
        'Set them in .env (see .env.example) or in your deployment environment.',
    );
  }

  return { url, authToken };
}
