'use server'

import { getPostsPage } from '@/external/repositories/postRepository.server'
import { postsPageInputSchema } from '@/external/schemas/postSchema'
import type { PostsPage } from '@/types/post'

// 無限スクロール用に記事一覧の1ページ分を取得する Server Action。
// 読み取りロジックは repository の getPostsPage に集約している。
export async function getPostsPageAction(input: unknown): Promise<PostsPage> {
  const parsed = postsPageInputSchema.safeParse(input)

  if (!parsed.success) {
    return { posts: [], nextCursor: null }
  }

  return getPostsPage({
    query: parsed.data.query,
    cursor: parsed.data.cursor,
  })
}
