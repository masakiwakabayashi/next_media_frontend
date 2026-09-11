'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { setUserBannedAction } from '@/external/handler/user/setUserBanned'
import type { UserProfileWithAuthStatus as UserProfile } from '@/types/profile'

type Props = {
  initialUsers: UserProfile[]
}

type ConfirmState = {
  user: UserProfile
  banned: boolean
}

export default function UserManager({ initialUsers }: Props) {
  const router = useRouter()
  const [users, setUsers] = useState(initialUsers)
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleToggleBan() {
    if (!confirmState || !confirmState.user.user_id) return
    const { user, banned } = confirmState
    const userId = user.user_id as string

    setError(null)
    setPendingId(user.id)
    setConfirmState(null)

    const { error: err } = await setUserBannedAction({ userId, banned })

    if (err) {
      setError(err)
      setPendingId(null)
      return
    }

    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, banned } : u)))
    setPendingId(null)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            ユーザー一覧（{users.length}件）
          </h2>
        </div>

        {users.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-zinc-400">
            ユーザーがいません
          </p>
        ) : (
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {users.map((user) => (
              <li key={user.id} className="flex items-center gap-4 px-6 py-4">
                <Avatar user={user} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      {user.display_name}
                    </span>
                    {user.email && (
                      <span className="text-xs text-zinc-400 dark:text-zinc-500">
                        {user.email}
                      </span>
                    )}
                    {user.isAdmin && (
                      <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-400">
                        管理者
                      </span>
                    )}
                    {user.banned && (
                      <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
                        無効
                      </span>
                    )}
                  </div>
                  {user.bio && (
                    <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
                      {user.bio}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="hidden text-xs text-zinc-400 dark:text-zinc-500 sm:block">
                    {formatDate(user.created_at)}
                  </span>
                  {user.user_id && (
                    <button
                      onClick={() =>
                        setConfirmState({ user, banned: !user.banned })
                      }
                      disabled={pendingId === user.id}
                      className={
                        user.banned
                          ? 'rounded border border-zinc-300 px-2 py-0.5 text-xs text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800'
                          : 'rounded border border-red-200 px-2 py-0.5 text-xs text-red-500 hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950'
                      }
                    >
                      {pendingId === user.id
                        ? '処理中...'
                        : user.banned
                          ? '有効化'
                          : '無効化'}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {confirmState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
            <h3 className="mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
              {confirmState.banned ? 'ユーザーを無効化' : 'ユーザーを有効化'}
            </h3>

            <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
              {confirmState.banned ? (
                <>
                  <strong>{confirmState.user.display_name}</strong>{' '}
                  を無効化します。無効化すると、このユーザーはログインできなくなります。
                </>
              ) : (
                <>
                  <strong>{confirmState.user.display_name}</strong>{' '}
                  を再度有効化し、ログインできるようにします。
                </>
              )}
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmState(null)}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                キャンセル
              </button>
              <button
                onClick={handleToggleBan}
                className={
                  confirmState.banned
                    ? 'rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700'
                    : 'rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300'
                }
              >
                {confirmState.banned ? '無効化する' : '有効化する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Avatar({ user }: { user: UserProfile }) {
  if (user.avatar_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.avatar_url}
        alt={user.display_name}
        className="h-9 w-9 shrink-0 rounded-full object-cover"
      />
    )
  }

  const initials = user.display_name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-xs font-semibold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
      {initials}
    </div>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}
