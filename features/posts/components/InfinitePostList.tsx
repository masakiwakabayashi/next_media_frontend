'use client'

import { useEffect, useRef } from 'react'
import type { InfiniteData } from '@tanstack/react-query'
import type { PostsPage } from '@/types/post'
import PostCard from './PostCard'

// 無限スクロール記事一覧の表示部分。取得ロジック（useInfiniteQuery）は
// 呼び出し側のフックに任せ、ここでは sentinel の監視と状態表示だけを担う。
type Props = {
  data: InfiniteData<PostsPage> | undefined
  error: unknown
  isPending: boolean
  isFetchingNextPage: boolean
  hasNextPage: boolean
  fetchNextPage: () => void
  emptyMessage: string
}

export default function InfinitePostList({
  data,
  error,
  isPending,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  emptyMessage,
}: Props) {
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = sentinelRef.current
    if (!el || !hasNextPage) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          fetchNextPage()
        }
      },
      { rootMargin: '400px 0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, fetchNextPage])

  if (isPending) {
    return <div className="py-8 text-center text-zinc-500">読み込み中...</div>
  }

  if (error) {
    return (
      <div className="py-8 text-center text-red-500">
        記事の読み込みに失敗しました
      </div>
    )
  }

  const posts = data?.pages.flatMap((page) => page.posts) ?? []

  if (posts.length === 0) {
    return <div className="text-center text-zinc-500">{emptyMessage}</div>
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      <div ref={sentinelRef} aria-hidden="true" />

      {isFetchingNextPage && (
        <div className="py-4 text-center text-sm text-zinc-500">
          読み込み中...
        </div>
      )}
      {!hasNextPage && (
        <div className="py-4 text-center text-sm text-zinc-400">
          すべての記事を表示しました
        </div>
      )}
    </div>
  )
}
