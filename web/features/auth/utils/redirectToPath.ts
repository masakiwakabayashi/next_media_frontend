import { NextResponse } from 'next/server'

// 同一オリジン内のパスへ相対 URL でリダイレクトする。
// Cloud Run（Next.js standalone）では request.url のホストが HOSTNAME / PORT
// （0.0.0.0:8080）から組み立てられるため、origin を使った絶対 URL にすると
// 誤ったホストへ飛んでしまう。相対 URL ならブラウザが現在のホストで解決する。
export function redirectToPath(path: string) {
  return new NextResponse(null, {
    status: 307,
    headers: { Location: path },
  })
}
