// lib/supabase/server が server-only を読み込むため、クライアントには取り込まれない
import { createServerSupabaseClient } from '@/lib/supabase/server'

export const FORBIDDEN_ERROR = 'この操作を行う権限がありません'

// Server Action は画面のガード（proxy / RequireAdmin）と無関係に任意のパスへの POST で
// 呼び出せるため、RLS を通らない supabaseAdmin を使う処理の前に必ず呼び出す。
// getSession() は Cookie を検証せずに信用するため、Auth サーバーで検証する getUser() を使う。
export async function assertAdmin(): Promise<{ error: string | null }> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user || user.app_metadata?.role !== 'admin') {
    return { error: FORBIDDEN_ERROR }
  }

  return { error: null }
}
