'use client'

import { ReactNode, useEffect, useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthProvider'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const redirectTo = useMemo(() => {
    if (!pathname) return null
    if (pathname === '/') return null
    const query = searchParams.toString()
    return query ? `${pathname}?${query}` : pathname
  }, [pathname, searchParams])

  useEffect(() => {
    if (loading || user) return

    const params = new URLSearchParams()
    if (redirectTo) {
      params.set('redirectTo', redirectTo)
    }

    router.replace(`/login${params.toString() ? `?${params.toString()}` : ''}`)
  }, [loading, user, router, redirectTo])

  if (loading || !user) {
    return <LoadingSpinner />
  }

  return <>{children}</>
}
