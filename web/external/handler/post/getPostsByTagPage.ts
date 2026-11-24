'use server'

import { getPostsByTagPage } from '@/external/repositories/postRepository.server'
import { tagPostsPageInputSchema } from '@/external/schemas/postSchema'
import type { PostsPage } from '@/types/post'

// 無限スクロール用にタグ別記事一覧の1ページ分を取得する Server Action。
// 読み取りロジックは repository の getPostsByTagPage に集約している。
export async function getPostsByTagPageAction(input: unknown): Promise<PostsPage> {
  const parsed = tagPostsPageInputSchema.safeParse(input)

  if (!parsed.success) {
    return { posts: [], nextCursor: null }
  }

  return getPostsByTagPage({
    tagSlug: parsed.data.tagSlug,
    cursor: parsed.data.cursor,
  })
}
