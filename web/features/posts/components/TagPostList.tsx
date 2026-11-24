'use client'

import { useTagPostsInfinite } from '../hooks/useTagPostsInfinite'
import InfinitePostList from './InfinitePostList'

type Props = {
  tagSlug: string
  tagName: string | null
}

export default function TagPostList({ tagSlug, tagName }: Props) {
  const {
    data,
    error,
    isPending,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useTagPostsInfinite(tagSlug)

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        #{tagName ?? tagSlug}
      </h1>

      <InfinitePostList
        data={data}
        error={error}
        isPending={isPending}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
        emptyMessage="このタグの記事はありません"
      />
    </div>
  )
}
