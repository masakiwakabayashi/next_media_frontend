// サーバー（RSC のプリフェッチ）とクライアント（useInfiniteQuery）で
// 同じ queryKey を使うために共有する。server-only を含まないので RSC から import 可。
export function postsQueryKey(query?: string) {
  return ['posts', 'infinite', { q: query?.trim() || null }] as const
}

export function categoryPostsQueryKey(categorySlug: string) {
  return ['posts', 'infinite', 'category', categorySlug] as const
}

export function tagPostsQueryKey(tagSlug: string) {
  return ['posts', 'infinite', 'tag', tagSlug] as const
}
