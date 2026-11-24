'use client'

import { useRouter } from 'next/navigation'
import { FormEvent } from 'react'

export default function SearchForm({ defaultValue }: { defaultValue?: string }) {
  const router = useRouter()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const query = (formData.get('q') as string).trim()

    if (!query) {
      return
    }

    router.push(`/?q=${encodeURIComponent(query)}`)
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={defaultValue}
          placeholder="記事のタイトル・本文を検索"
          className="flex-1 rounded-lg border border-zinc-200 px-4 py-2 text-zinc-900 focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-600"
        />
        <button
          type="submit"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          検索
        </button>
      </div>
    </form>
  )
}
