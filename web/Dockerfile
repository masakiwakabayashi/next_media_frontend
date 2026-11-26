# syntax=docker/dockerfile:1
# 開発用イメージ（docker-compose.yml から使う）
# ビルドコンテキストはリポジトリのルート
FROM node:20.18.0-bookworm-slim

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY web/package.json ./web/
COPY shared/package.json ./shared/
# Node 20.18 同梱の corepack は古く、pnpm 10 の署名検証で失敗するため更新してから有効化する
RUN npm install -g corepack@latest && corepack enable && pnpm install --frozen-lockfile --filter web...

COPY . .

WORKDIR /app/web

EXPOSE 3000

CMD ["pnpm", "dev", "-p", "3000", "-H", "0.0.0.0"]
