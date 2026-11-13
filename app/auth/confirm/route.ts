import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { confirmEmailOtp } from '@/external/handler/auth/confirmEmailOtp'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'

  if (token_hash && type) {
    const { error } = await confirmEmailOtp({ type, token_hash })

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // 検証失敗時は種別ごとの画面に戻し、そこで「リンクが無効」の案内を表示する
  const fallbackPath = type === 'recovery' ? '/reset-password' : '/invite'
  return NextResponse.redirect(`${origin}${fallbackPath}`)
}
