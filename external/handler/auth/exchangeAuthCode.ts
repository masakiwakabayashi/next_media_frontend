import 'server-only'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { exchangeCodeForSession } from '@/external/repositories/authRepository'

export async function exchangeAuthCode(code: string): Promise<{ error: string | null }> {
  const supabase = await createServerSupabaseClient()
  return exchangeCodeForSession(supabase, code)
}
