'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import type { PostsCursor } from '@/types/post'
import { getPostsByCategoryPageAction } from '@/external/handler/post/getPostsByCategoryPage'
import { categoryPostsQueryKey } from '../api/postsQuery'

export function useCategoryPostsInfinite(categorySlug: string) {
  return useInfiniteQuery({
    queryKey: categoryPostsQueryKey(categorySlug),
    queryFn: ({ pageParam }) =>
      getPostsByCategoryPageAction({ categorySlug, cursor: pageParam }),
    initialPageParam: null as PostsCursor | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  })
}
