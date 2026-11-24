'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { requestPasswordReset } from '@/external/repositories/authRepository'

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSent, setIsSent] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const { error: requestError } = await requestPasswordReset(email)

    if (requestError) {
      setError(requestError)
      setIsSubmitting(false)
      return
    }

    // アカウントの有無を推測されないよう、登録の有無にかかわらず同じ表示にする
    setIsSent(true)
    setIsSubmitting(false)
  }

  if (isSent) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-zinc-300 bg-zinc-50 p-4 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
          {email} 宛てにパスワード再設定用のメールを送信しました。メール内のリンクから新しいパスワードを設定してください。
          <br />
          メールが届かない場合は、迷惑メールフォルダもご確認ください。
        </div>
        <Link href="/login" className="block text-center text-sm text-zinc-600 underline hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
          ログイン画面に戻る
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">パスワードの再設定</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          登録済みのメールアドレスを入力してください。パスワード再設定用のリンクをお送りします。
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          メールアドレス
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoComplete="email"
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-700 dark:hover:bg-zinc-600"
      >
        {isSubmitting ? '送信中...' : '再設定メールを送信'}
      </button>

      <Link href="/login" className="block text-center text-sm text-zinc-600 underline hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
        ログイン画面に戻る
      </Link>
    </form>
  )
}
