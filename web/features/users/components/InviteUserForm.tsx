'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { inviteUserAction } from '@/external/handler/user/inviteUser'

export default function InviteUserForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsSubmitting(true)

    const { error: err } = await inviteUserAction({
      email,
      displayName: displayName || null,
    })

    if (err) {
      setError(err)
      setIsSubmitting(false)
      return
    }

    setSuccess(`${email} に招待メールを送信しました`)
    setEmail('')
    setDisplayName('')
    setIsSubmitting(false)
    router.refresh()
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        ユーザーを招待
      </h2>

      {error && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-48">
          <label
            htmlFor="invite-email"
            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            メールアドレス <span className="text-red-500">*</span>
          </label>
          <input
            id="invite-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="例: user@example.com"
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>
        <div className="flex-1 min-w-40">
          <label
            htmlFor="invite-display-name"
            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            表示名
          </label>
          <input
            id="invite-display-name"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="任意"
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {isSubmitting ? '送信中...' : '招待を送る'}
        </button>
      </form>
    </div>
  )
}
