'use client'

import { useState, FormEvent } from 'react'
import { useAuth } from '@/contexts/AuthProvider'
import { updateDisplayName } from '@/external/repositories/profileRepository'

export default function ProfileEditor() {
  const { user, displayName, refreshDisplayName } = useAuth()
  const [prevDisplayName, setPrevDisplayName] = useState(displayName)
  const [value, setValue] = useState(displayName ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  if (displayName !== prevDisplayName) {
    setPrevDisplayName(displayName)
    setValue(displayName ?? '')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    setError(null)
    setSaved(false)
    setIsSubmitting(true)

    const { error } = await updateDisplayName(user.id, value.trim())

    setIsSubmitting(false)

    if (error) {
      setError('保存に失敗しました。もう一度お試しください。')
      return
    }

    await refreshDisplayName()
    setSaved(true)
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-6 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        プロフィール設定
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="display_name"
            className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            表示名 <span className="text-red-500">*</span>
          </label>
          <input
            id="display_name"
            type="text"
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              setSaved(false)
            }}
            required
            maxLength={50}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <p className="mt-1 text-xs text-zinc-400">{value.length}/50</p>
        </div>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        {saved && (
          <p className="text-sm text-green-600 dark:text-green-400">保存しました</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting || value.trim() === ''}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {isSubmitting ? '保存中...' : '保存する'}
        </button>
      </form>
    </div>
  )
}
