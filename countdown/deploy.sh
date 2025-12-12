docker buildx build -t asia-east1-docker.pkg.dev/frash-447004/countdown/countdown:latest --platform linux/amd64 .

docker push asia-east1-docker.pkg.dev/frash-447004/countdown/countdown:latest

gcloud run deploy countdown --image asia-east1-docker.pkg.dev/frash-447004/countdown/countdown:latest --platform managed --set-env-vars NODE_ENV=production --region=asia-east1

gcloud run services update-traffic countdown --to-latest --region=asia-east1