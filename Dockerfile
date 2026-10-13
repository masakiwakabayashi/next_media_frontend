# syntax=docker/dockerfile:1
FROM node:20.18.0-bookworm-slim

WORKDIR /app

ENV NODE_ENV=development \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    PATH=/app/node_modules/.bin:$PATH

COPY package.json pnpm-lock.yaml ./
# Node 20.18 同梱の corepack は古く、pnpm 10 の署名検証で失敗するため更新してから有効化する
RUN npm install -g corepack@latest && corepack enable && pnpm install --frozen-lockfile

COPY . .

EXPOSE 3000

CMD ["pnpm", "dev", "-p", "3000", "-H", "0.0.0.0"]
