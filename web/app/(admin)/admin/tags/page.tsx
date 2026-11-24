import { Metadata } from 'next'
import Link from 'next/link'
import TagManager from '@/features/tags/components/TagManager'
import { getTags } from '@/external/repositories/tagRepository.server'

export const metadata: Metadata = {
  title: 'タグ管理',
}

export default async function AdminTagsPage() {
  const tags = await getTags()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          タグ管理
        </h1>
        <Link
          href="/admin"
          className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          ← ダッシュボードへ
        </Link>
      </div>

      <TagManager initialTags={tags} />
    </div>
  )
}
