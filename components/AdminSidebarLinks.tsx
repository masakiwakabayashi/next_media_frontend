'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthProvider'

export default function AdminSidebarLinks() {
  const { isAdmin, loading } = useAuth()

  if (loading || !isAdmin) return null

  return (
    <div className="space-y-2">
      <Link
        href="/admin"
        className="flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-zinc-700 dark:hover:bg-zinc-600"
      >
        管理者ダッシュボード
      </Link>
      <Link
        href="/admin/posts/new"
        className="flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-zinc-700 dark:hover:bg-zinc-600"
      >
        記事を作成
      </Link>
      <Link
        href="/admin/posts/drafts"
        className="flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-zinc-700 dark:hover:bg-zinc-600"
      >
        下書き一覧
      </Link>
      <Link
        href="/admin/collections/new"
        className="flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-zinc-700 dark:hover:bg-zinc-600"
      >
        特集を作成
      </Link>
      <Link
        href="/admin/tags"
        className="flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-zinc-700 dark:hover:bg-zinc-600"
      >
        タグ管理
      </Link>
      <Link
        href="/admin/users"
        className="flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-zinc-700 dark:hover:bg-zinc-600"
      >
        ユーザー管理
      </Link>
    </div>
  )
}
