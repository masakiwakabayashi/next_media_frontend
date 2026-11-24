'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import type { PostsCursor } from '@/types/post'
import { getPostsByTagPageAction } from '@/external/handler/post/getPostsByTagPage'
import { tagPostsQueryKey } from '../api/postsQuery'

export function useTagPostsInfinite(tagSlug: string) {
  return useInfiniteQuery({
    queryKey: tagPostsQueryKey(tagSlug),
    queryFn: ({ pageParam }) =>
      getPostsByTagPageAction({ tagSlug, cursor: pageParam }),
    initialPageParam: null as PostsCursor | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  })
}
