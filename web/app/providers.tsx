'use client'

import { useState, type ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { makeQueryClient } from '@/lib/react-query'

export default function Providers({ children }: { children: ReactNode }) {
  // レンダーごとに新しい QueryClient を作らないよう state で保持する。
  const [queryClient] = useState(makeQueryClient)

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
