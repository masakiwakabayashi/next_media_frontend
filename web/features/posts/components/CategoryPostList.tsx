'use client'

import { useCategoryPostsInfinite } from '../hooks/useCategoryPostsInfinite'
import InfinitePostList from './InfinitePostList'

type Props = {
  categorySlug: string
  categoryName: string | null
}

export default function CategoryPostList({ categorySlug, categoryName }: Props) {
  const {
    data,
    error,
    isPending,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useCategoryPostsInfinite(categorySlug)

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        {categoryName ?? categorySlug}
      </h1>

      <InfinitePostList
        data={data}
        error={error}
        isPending={isPending}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
        emptyMessage="このカテゴリーの記事はありません"
      />
    </div>
  )
}
