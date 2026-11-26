// posts の読み取り（公開済み記事の一覧・詳細）で使う型定義。
// 書き込み・編集用の型（CreatePostData, PostForEdit など）は web/types/post.ts にある。

export type PostSummary = {
  id: string
  title: string
  slug: string
  image_path: string | null
  // 表示用の画像URL（ストレージの画像は署名付きURL）。image_path から組み立てる
  image_url: string | null
  content: string
  status: 'draft' | 'published' | 'archived'
  published_at: string | null
  created_at: string
  author: {
    display_name: string
  } | null
  category: {
    name: string
    slug: string
  } | null
  post_tags: {
    tag: {
      id: string
      name: string
      slug: string
    }
  }[]
}

export type Post = {
  id: string
  title: string
  slug: string
  image_path: string | null
  // 表示用の画像URL（ストレージの画像は署名付きURL）。image_path から組み立てる
  image_url: string | null
  content: string
  google_maps_url: string | null
  status: 'draft' | 'published' | 'archived'
  published_at: string | null
  created_at: string
  author: {
    display_name: string
    bio: string | null
    avatar_url: string | null
  } | null
  category: {
    name: string
    slug: string
  } | null
  post_tags: {
    tag: {
      id: string
      name: string
      slug: string
    }
  }[]
}

// 無限スクロール用のカーソル。(published_at, id) の複合キーで
// 「最後に読み込んだ記事より後ろ」を表す。
export type PostsCursor = {
  publishedAt: string
  id: string
}

export type PostsPage = {
  posts: PostSummary[]
  nextCursor: PostsCursor | null
}
