# Turso credentials (CountDown)

Turso connection settings are **not** stored in this repository. The running CountDown service continues to use the **same** database and auth token as before; this change only moves configuration into the environment.

## Required environment variables

| Variable | Description |
|----------|-------------|
| `TURSO_DATABASE_URL` | libSQL URL for the CountDown Turso database |
| `TURSO_AUTH_TOKEN` | Turso auth token for that database |

Set both in every environment where the app or Drizzle tooling runs (Cloud Run, CI, local dev).

### Google Cloud Run

Update the service with the **existing** values (copy from your secure store or the current deployment — do not commit them to git):

Prefer Secret Manager (already configured for CountDown):

- `countdown-turso-url` → `TURSO_DATABASE_URL`
- `countdown-turso-token` → `TURSO_AUTH_TOKEN`

From the `countdown/` directory, run `./deploy.sh` (builds, pushes, deploys with `--set-secrets`, routes traffic to latest, and runs an HTTP smoke check). Ensure `gcloud` is authenticated for project `frash-447004`, or set `GCP_SA_KEY_JSON` to a deploy service account key for non-interactive use.

### Local development

Copy `.env.example` to `.env` in the `countdown/` directory and fill in the same credentials you use in production (locally only; `.env` is gitignored).

## Git history

Repository history was rewritten to remove previously committed secrets. After pulling, use `git fetch --all` and reset local branches to match `origin/main` if your clone predates the rewrite.
