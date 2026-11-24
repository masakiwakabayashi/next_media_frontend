// オープンリダイレクトを防ぐため、同一オリジン内の絶対パスのみ許可する。
// "//evil.example" や "/\evil.example" はブラウザが外部ホストとして解釈するため弾く
export function getSafeNextPath(next: string | null): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) {
    return '/'
  }
  return next
}
