#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${GCP_PROJECT_ID:-frash-447004}"
REGION="${GCP_REGION:-asia-east1}"
SERVICE_NAME="${CLOUD_RUN_SERVICE:-countdown}"
IMAGE="asia-east1-docker.pkg.dev/${PROJECT_ID}/countdown/countdown:latest"

if [[ -n "${GCP_SA_KEY_JSON:-}" ]]; then
  KEY_FILE="$(mktemp)"
  trap 'rm -f "$KEY_FILE"' EXIT
  printf '%s' "$GCP_SA_KEY_JSON" > "$KEY_FILE"
  gcloud auth activate-service-account --key-file="$KEY_FILE" --project="$PROJECT_ID"
fi

gcloud config set project "$PROJECT_ID"
gcloud auth configure-docker asia-east1-docker.pkg.dev --quiet

if docker buildx version >/dev/null 2>&1; then
  docker buildx build -t "$IMAGE" --platform linux/amd64 --load .
else
  docker build -t "$IMAGE" .
fi
docker push "$IMAGE"

gcloud run deploy "$SERVICE_NAME" \
  --image "$IMAGE" \
  --platform managed \
  --region "$REGION" \
  --project "$PROJECT_ID" \
  --set-env-vars "NODE_ENV=production" \
  --set-secrets "TURSO_DATABASE_URL=countdown-turso-url:latest,TURSO_AUTH_TOKEN=countdown-turso-token:latest"

gcloud run services update-traffic "$SERVICE_NAME" \
  --to-latest \
  --region "$REGION" \
  --project "$PROJECT_ID"

SERVICE_URL="$(gcloud run services describe "$SERVICE_NAME" \
  --region "$REGION" \
  --project "$PROJECT_ID" \
  --format='value(status.url)')"

LATEST_REVISION="$(gcloud run services describe "$SERVICE_NAME" \
  --region "$REGION" \
  --project "$PROJECT_ID" \
  --format='value(status.latestReadyRevisionName)')"

echo "Service URL: ${SERVICE_URL}"
echo "Latest ready revision: ${LATEST_REVISION}"

HTTP_CODE="$(curl -sS -o /dev/null -w '%{http_code}' "${SERVICE_URL}/" || true)"
echo "Smoke check GET / -> HTTP ${HTTP_CODE}"

if [[ "$HTTP_CODE" != "200" && "$HTTP_CODE" != "307" && "$HTTP_CODE" != "308" ]]; then
  echo "Smoke check failed (expected 200 or redirect)." >&2
  exit 1
fi
