// collections に関する、コンポーネントとリポジトリの双方から参照する型定義。
export type Collection = {
  id: string
  title: string
  slug: string
  description: string | null
  image_path: string | null
  published_at: string | null
}

export type CollectionPost = {
  position: number
  post: {
    id: string
    title: string
    slug: string
    image_path: string | null
    content: string
    published_at: string | null
    category: {
      name: string
      slug: string
    } | null
  }
}

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
