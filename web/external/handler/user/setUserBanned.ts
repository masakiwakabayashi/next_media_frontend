'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase/server'
import { setUserBannedSchema } from '@/external/schemas/userSchema'
import { assertAdmin } from '@/external/handler/auth/assertAdmin'

// Supabase では無期限BANを表現する期間指定が無いため、
// 公式ドキュメント記載の慣例(100年)を無効化として扱う
const BAN_DURATION = '876000h'

export async function setUserBannedAction(
  input: unknown
): Promise<{ error: string | null }> {
  const adminCheck = await assertAdmin()

  if (adminCheck.error) {
    return adminCheck
  }

  const parsed = setUserBannedSchema.safeParse(input)

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? '入力内容が不正です' }
  }

  const { userId, banned } = parsed.data

  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    ban_duration: banned ? BAN_DURATION : 'none',
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/users')

  return { error: null }
}
