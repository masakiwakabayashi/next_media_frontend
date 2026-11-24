import 'server-only'
import { supabaseAdmin } from '@/lib/supabase/server'

export type AuthUserStatus = {
  email: string | null
  banned: boolean
  isAdmin: boolean
}

function isBanned(bannedUntil: string | null | undefined): boolean {
  if (!bannedUntil) return false
  return new Date(bannedUntil).getTime() > Date.now()
}

export async function getAuthUserStatuses(): Promise<Map<string, AuthUserStatus>> {
  const statuses = new Map<string, AuthUserStatus>()
  const perPage = 200
  let page = 1

  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage })

    if (error) {
      console.error('Error fetching auth users:', error)
      break
    }

    for (const user of data.users) {
      statuses.set(user.id, {
        email: user.email ?? null,
        banned: isBanned(user.banned_until),
        isAdmin: user.app_metadata?.role === 'admin',
      })
    }

    if (data.users.length < perPage) break
    page += 1
  }

  return statuses
}

export async function inviteUser(
  email: string,
  displayName: string | null,
  redirectTo: string
): Promise<{ error: string | null }> {
  const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    data: displayName ? { full_name: displayName } : undefined,
    redirectTo,
  })

  if (error) {
    return { error: error.message }
  }

  return { error: null }
}
