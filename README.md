## Token create
```bash
openssl rand -base64 32
```

## Deploy
```bash
# artifact registry の作成
gcloud artifacts repositories create countdown \
    --repository-format=docker \
    --location=asia-east1 \
    --description="Frontend Docker images"

# artifact registry の認証
gcloud auth configure-docker asia-east1-docker.pkg.dev

# ビルド
docker buildx build -t asia-east1-docker.pkg.dev/frash-447004/countdown/countdown:latest --platform linux/amd64 .

# プッシュ
docker push asia-east1-docker.pkg.dev/frash-447004/countdown/countdown:latest


gcloud run deploy countdown --image asia-east1-docker.pkg.dev/frash-447004/countdown/countdown:latest --platform managed --set-env-vars NODE_ENV=production --region=asia-east1

gcloud run services update-traffic countdown --to-latest --region=asia-east1

gcloud artifacts repositories delete countdown --location=asia-east1
```

## No Left Space
```bash
docker system df

docker system prune -a

docker system prune --volumes
```