import { type NextRequest, NextResponse } from 'next/server'
import { exchangeAuthCode } from '@/external/handler/auth/exchangeAuthCode'

// Supabase のデフォルトメールテンプレート（PKCE フロー）から戻ってきたときの受け口。
// ?code= をセッションに交換し、next で指定された画面へ進める。
// code_verifier は申請したブラウザの Cookie にあるため、別のブラウザで開くと交換に失敗する。
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = getSafeNextPath(searchParams.get('next'))

  // 交換に失敗しても遷移先へ進める。セッションが無い場合は遷移先の画面
  // （/reset-password など）が「リンクが無効」の案内を表示する
  if (code) {
    await exchangeAuthCode(code)
  }

  return NextResponse.redirect(`${origin}${next}`)
}

// オープンリダイレクトを防ぐため、同一オリジン内の絶対パスのみ許可する
function getSafeNextPath(next: string | null): string {
  if (!next || !next.startsWith('/') || next.startsWith('//')) {
    return '/'
  }
  return next
}
