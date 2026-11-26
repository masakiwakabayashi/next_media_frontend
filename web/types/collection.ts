// collections に関する、コンポーネントとリポジトリの双方から参照する型定義。
// 読み取り（公開済みコレクションの一覧・詳細）の型は、mobile と共有するため shared/src/types/collection.ts にある。
// ここでは web からの import を変えずに済むよう re-export し、web 専用（編集・管理画面）の型だけを定義する。
export type { Collection, CollectionPost } from 'shared/types/collection'

// 特集に紐づく記事の編集フォーム表示用（表示順は position 昇順）。
export type CollectionLinkedPost = {
  id: string
  title: string
  slug: string
}

// 管理者の編集フォーム用。下書き・非公開も含めて取得するため status で絞らない
// （collections の RLS で管理者以外は下書きを閲覧できない）。
export type CollectionForEdit = {
  id: string
  title: string
  slug: string
  description: string | null
  image_path: string | null
  status: 'draft' | 'published' | 'archived'
  published_at: string | null
  posts: CollectionLinkedPost[]
}

export type UpdateCollectionInput = {
  title: string
  slug: string
  description: string | null
  image_path: string | null
  status: 'draft' | 'published' | 'archived'
  published_at: string | null
}

export type CreateCollectionData = UpdateCollectionInput
