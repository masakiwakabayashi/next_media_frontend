// posts に関する、コンポーネントとリポジトリの双方から参照する型定義。
// 読み取り（公開済み記事の一覧・詳細）の型は、mobile と共有するため shared/src/types/post.ts にある。
// ここでは web からの import を変えずに済むよう re-export し、web 専用（作成・編集・管理画面）の型だけを定義する。
import type { CreatePostInput } from '@/external/schemas/postSchema'
import type { PostSummary } from 'shared/types/post'

export type { PostSummary, Post, PostsCursor, PostsPage } from 'shared/types/post'

export type CreatePostData = CreatePostInput

export type PostListResult = {
  posts: PostSummary[]
  totalCount: number
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
