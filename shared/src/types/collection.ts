// collections の読み取り（公開済みコレクションの一覧・詳細）で使う型定義。
// 編集用の型（CollectionForEdit, UpdateCollectionInput など）は web/types/collection.ts にある。
export type Collection = {
  id: string
  title: string
  slug: string
  description: string | null
  image_path: string | null
  // 表示用の画像URL（ストレージの画像は署名付きURL）。image_path から組み立てる
  image_url: string | null
  published_at: string | null
}

export type CollectionPost = {
  position: number
  post: {
    id: string
    title: string
    slug: string
    image_path: string | null
    image_url: string | null
    content: string
    published_at: string | null
    category: {
      name: string
      slug: string
    } | null
  }
}
