# shared

web（Next.js）と mobile（Expo）で共有する、**読み取り専用**のコード。

ディレクトリ構成は web と同じにしている（`src/types` ↔ `web/types`、`src/external` ↔ `web/external`）。

```
src/
├── types/                    # 読み取り用の型（記事・カテゴリ・タグ・コレクション）
└── external/
    ├── database/
    │   └── database.types.ts # DB の型（pnpm gen:types の出力先）
    └── repositories/         # 公開済みデータの読み取りクエリ
```

## ルール

- **読み取りだけを置く**。insert / update / delete / upsert や、Storage へのアップロードは置かない（書き込みは web の管理画面だけで行う）
- **公開済みのデータだけを返す**。記事・コレクションは必ず `status = 'published'` で絞る（RLS では管理者が下書きを読めるため）
- **Next.js や React Native に依存しない**。`next/*`、`react`、`react-native`、web の `@/...` は import しない。import は `@supabase/supabase-js` と、このパッケージ内の相対パスだけにする
- **Supabase クライアントは引数で受け取る**。クライアントの作り方（Cookie、SecureStore など）は、web と mobile のそれぞれで決める
- **まとめて export するファイル（index.ts）は作らない**。パスを指定して import する

```ts
import { getPost } from 'shared/external/repositories/postRepository'
import type { Post } from 'shared/types/post'
```
