'use client'

import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthProvider'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function RequireAdmin({ children }: { children: ReactNode }) {
  const { isAdmin, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!isAdmin) router.replace('/')
  }, [loading, isAdmin, router])

  if (loading || !isAdmin) {
    return <LoadingSpinner />
  }

  return <>{children}</>
}
