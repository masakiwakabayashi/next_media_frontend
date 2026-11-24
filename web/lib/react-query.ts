import { QueryClient } from '@tanstack/react-query'

// クライアント（Provider）とサーバー（RSC でのプリフェッチ）の両方で使う
// QueryClient のファクトリ。設定を一箇所に集約する。
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        refetchOnWindowFocus: false,
      },
    },
  })
}
