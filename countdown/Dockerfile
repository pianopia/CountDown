# ベースイメージを指定
FROM node:20-alpine AS build

WORKDIR /app

# パッケージ依存関係のコピーとインストール
COPY package*.json ./
RUN npm ci

# Build-only placeholders (runtime uses Cloud Run secrets; not real credentials).
ARG TURSO_DATABASE_URL=libsql://build-placeholder.turso.io
ARG TURSO_AUTH_TOKEN=build-placeholder-token
ENV NODE_ENV=production
ENV TURSO_DATABASE_URL=$TURSO_DATABASE_URL
ENV TURSO_AUTH_TOKEN=$TURSO_AUTH_TOKEN

# ソースコードをコピー
COPY . .

# キャッシュを活用してビルド
RUN npm run build

CMD ["npm", "run", "start"]