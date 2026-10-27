docker buildx build -t asia-east1-docker.pkg.dev/frash-447004/countdown/countdown:latest --platform linux/amd64 .

docker push asia-east1-docker.pkg.dev/frash-447004/countdown/countdown:latest

# TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set on the Cloud Run service (see SECURITY-DEPLOY.md).
gcloud run deploy countdown --image asia-east1-docker.pkg.dev/frash-447004/countdown/countdown:latest --platform managed --set-env-vars NODE_ENV=production --region=asia-east1

gcloud run services update-traffic countdown --to-latest --region=asia-east1