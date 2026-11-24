'use client'

import { usePostsInfinite } from '../hooks/usePostsInfinite'
import InfinitePostList from './InfinitePostList'

export default function PostList({ query }: { query?: string }) {
  const {
    data,
    error,
    isPending,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = usePostsInfinite(query)

  return (
    <InfinitePostList
      data={data}
      error={error}
      isPending={isPending}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
      fetchNextPage={fetchNextPage}
      emptyMessage={
        query ? `「${query}」に一致する記事がありません` : '記事がありません'
      }
    />
  )
}
