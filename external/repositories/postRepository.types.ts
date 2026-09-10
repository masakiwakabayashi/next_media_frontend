// posts リポジトリ（client / server 共通）の型定義。
// 実装は postRepository.ts（書き込み）と postRepository.server.ts（読み取り）に分かれるが、
// 型はここに集約し、両方から re-export する。
import type { CreatePostInput } from '@/external/schemas/postSchema'

export type PostSummary = {
  id: string
  title: string
  slug: string
  image_path: string | null
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

export type CreatePostData = CreatePostInput

export type PostListResult = {
  posts: PostSummary[]
  totalCount: number
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

export type PostMeta = {
  title: string
  content: string
  image_path: string | null
}

// セレクトボックス等で記事を選ばせるための軽量な選択肢。
export type PostOption = {
  id: string
  title: string
  slug: string
}

export type PostForEdit = {
  id: string
  title: string
  slug: string
  image_path: string | null
  content: string
  status: 'draft' | 'published' | 'archived'
  published_at: string | null
  category_id: string | null
  author_id: string
  post_tags: {
    tag: {
      id: string
      name: string
      slug: string
    }
  }[]
}
