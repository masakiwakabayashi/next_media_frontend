
## ⚡ Production

https://next-media-frontend.com/


## ⚡ 構成

pnpm workspace のモノレポ。

| ディレクトリ | 内容 |
|---|---|
| `web/` | Next.js（Web アプリ・管理画面）。env ファイル（`.env` / `.env.test` / `.env.production`）もここに置く |
| `shared/` | web と mobile で共有する読み取り専用のコード（DB の型・読み取り用の型・公開済みデータの読み取りクエリ）。詳しくは `shared/README.md` |
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
# すべて実行（下の2つを順に実行する）
pnpm test

# Web のユニットテスト
pnpm test:unit

# RLS テスト（supabase/tests。ローカル Supabase の起動が必要）
pnpm test:rls
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







