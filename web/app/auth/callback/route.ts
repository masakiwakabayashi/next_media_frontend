import { type NextRequest } from 'next/server'
import { exchangeAuthCode } from '@/external/handler/auth/exchangeAuthCode'
import { redirectToPath } from '@/features/auth/utils/redirectToPath'
import { getSafeNextPath } from '@/features/auth/utils/getSafeNextPath'

// Supabase のデフォルトメールテンプレート（PKCE フロー）から戻ってきたときの受け口。
// ?code= をセッションに交換し、next で指定された画面へ進める。
// code_verifier は申請したブラウザの Cookie にあるため、別のブラウザで開くと交換に失敗する。
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const code = searchParams.get('code')
  const next = getSafeNextPath(searchParams.get('next'))

  // 交換に失敗しても遷移先へ進める。セッションが無い場合は遷移先の画面
  // （/reset-password など）が「リンクが無効」の案内を表示する
  if (code) {
    await exchangeAuthCode(code)
  }

  return redirectToPath(next)
}

