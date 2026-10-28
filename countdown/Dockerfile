# ベースイメージを指定
FROM node:24.22.1-alpine AS build

# better-sqlite3 has no Node 24 prebuild for v11; toolchain for node-gyp
RUN apk add --no-cache python3 make g++

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