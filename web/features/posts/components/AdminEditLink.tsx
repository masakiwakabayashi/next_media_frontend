'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthProvider'

type Props = {
  slug: string
}

export default function AdminEditLink({ slug }: Props) {
  const { isAdmin } = useAuth()

  if (!isAdmin) return null

  return (
    <Link
      href={`/admin/posts/${slug}/edit`}
      className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-zinc-700 dark:hover:bg-zinc-600"
    >
      編集
    </Link>
  )
}
