'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import type { PostsCursor } from '@/types/post'
import { getPostsPageAction } from '@/external/handler/post/getPostsPage'
import { postsQueryKey } from '../api/postsQuery'

export function usePostsInfinite(query?: string) {
  return useInfiniteQuery({
    queryKey: postsQueryKey(query),
    queryFn: ({ pageParam }) =>
      getPostsPageAction({ query, cursor: pageParam }),
    initialPageParam: null as PostsCursor | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  })
}
