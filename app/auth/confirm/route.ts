import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'
import { confirmEmailOtp } from '@/external/handler/auth/confirmEmailOtp'
import { redirectToPath } from '@/features/auth/utils/redirectToPath'
import { getSafeNextPath } from '@/features/auth/utils/getSafeNextPath'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = getSafeNextPath(searchParams.get('next'))

  if (token_hash && type) {
    const { error } = await confirmEmailOtp({ type, token_hash })

    if (!error) {
      return redirectToPath(next)
    }
  }

  // 検証失敗時は種別ごとの画面に戻し、そこで「リンクが無効」の案内を表示する
  const fallbackPath = type === 'recovery' ? '/reset-password' : '/invite'
  return redirectToPath(fallbackPath)
}
