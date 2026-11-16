import type {
  AuthChangeEvent,
  EmailOtpType,
  Session,
  SupabaseClient,
} from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

export async function signInWithPassword(
  email: string,
  password: string
): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

  return { error: null }
}

export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession()
  return data.session
}

export function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void
) {
  const { data: listener } = supabase.auth.onAuthStateChange(callback)
  return () => listener.subscription.unsubscribe()
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut()
}

export async function verifyEmailOtp(
  client: SupabaseClient,
  params: { type: EmailOtpType; token_hash: string }
): Promise<{ error: string | null }> {
  const { error } = await client.auth.verifyOtp(params)

  if (error) {
    return { error: error.message }
  }

  return { error: null }
}

export async function exchangeCodeForSession(
  client: SupabaseClient,
  code: string
): Promise<{ error: string | null }> {
  const { error } = await client.auth.exchangeCodeForSession(code)

  if (error) {
    return { error: error.message }
  }

  return { error: null }
}

export async function requestPasswordReset(email: string): Promise<{ error: string | null }> {
  // デフォルトのメールテンプレート（{{ .ConfirmationURL }}）を使う環境では、
  // 検証後にこの URL へ ?code= 付きで戻ってくる。
  // カスタムテンプレート（/auth/confirm?token_hash=...）を使う環境では使われない。
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { error: null }
}

export async function updatePassword(password: string): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { error: error.message }
  }

  return { error: null }
}
