import 'server-only'
import type { EmailOtpType } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { verifyEmailOtp } from '@/external/repositories/authRepository'

export async function confirmEmailOtp(params: {
  type: EmailOtpType
  token_hash: string
}): Promise<{ error: string | null }> {
  const supabase = await createServerSupabaseClient()
  return verifyEmailOtp(supabase, params)
}
