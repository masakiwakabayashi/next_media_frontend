
## ⚡ Production

https://next-media-frontend.com/


## ⚡ 構成

pnpm workspace のモノレポ。

| ディレクトリ | 内容 |
|---|---|
| `web/` | Next.js（Web アプリ・管理画面）。env ファイル（`.env` / `.env.test` / `.env.production`）もここに置く |
| `supabase/` | マイグレーション・シード・DB テスト・RLS テスト |
| `scripts/` | リポジトリ全体で使うスクリプト |

コマンドはリポジトリのルートで実行する。

## ⚡ Frontend

```
docker compose up -d
```

```
pnpm dev
```

### Testing

```
# Web のユニットテスト + RLS テスト（RLS テストはローカル Supabase の起動が必要）
pnpm test
```

```
pnpm --filter web exec playwright test
```

### Supabase

```
supabase db diff -f create
```

```
supabase db dump --local --data-only --schema public -f dump.sql
```

#### Supabaseの型定義を更新

```
pnpm gen:types
```







