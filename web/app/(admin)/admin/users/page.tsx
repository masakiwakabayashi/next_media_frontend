import { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import UserManager from '@/features/users/components/UserManager'
import InviteUserForm from '@/features/users/components/InviteUserForm'
import { getUserProfiles } from '@/external/repositories/profileRepository.server'
import { getAuthUserStatuses } from '@/external/repositories/authAdminRepository'

export const metadata: Metadata = {
  title: 'ユーザー管理',
}

// 次は全体的にテストコードを書いていく

export default async function AdminUsersPage() {
  const [profiles, authStatuses] = await Promise.all([
    getUserProfiles(),
    getAuthUserStatuses(),
  ])

  const users = profiles.map((profile) => {
    const status = profile.user_id ? authStatuses.get(profile.user_id) : undefined
    return {
      ...profile,
      email: status?.email ?? undefined,
      banned: status?.banned ?? false,
      isAdmin: status?.isAdmin ?? false,
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          ユーザー管理
        </h1>
        <Link
          href="/admin"
          className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          ← ダッシュボードへ
        </Link>
      </div>

      <Suspense>
        <InviteUserForm />
        <div className="mt-6">
          <UserManager initialUsers={users} />
        </div>
      </Suspense>
    </div>
  )
}
