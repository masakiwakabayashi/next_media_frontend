'use client'

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { getSession, onAuthStateChange, signOut as authSignOut } from '@/external/repositories/authRepository'
import { getDisplayName } from '@/external/repositories/profileRepository'

type AuthContextValue = {
  user: User | null
  session: Session | null
  loading: boolean
  isAdmin: boolean
  displayName: string | null
  refreshDisplayName: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [displayName, setDisplayName] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    getSession().then((session) => {
      if (!isMounted) return
      setSession(session)
      setLoading(false)
    })

    const unsubscribe = onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [])

  async function fetchDisplayName(userId: string) {
    const name = await getDisplayName(userId)
    setDisplayName(name)
  }

  useEffect(() => {
    let ignore = false
    const userId = session?.user?.id

    async function syncDisplayName() {
      if (!userId) {
        if (!ignore) setDisplayName(null)
        return
      }
      const name = await getDisplayName(userId)
      if (!ignore) setDisplayName(name)
    }

    syncDisplayName()

    return () => {
      ignore = true
    }
  }, [session?.user?.id])

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      loading,
      isAdmin: session?.user?.app_metadata?.role === 'admin',
      displayName,
      refreshDisplayName: async () => {
        if (session?.user) await fetchDisplayName(session.user.id)
      },
      signOut: async () => {
        await authSignOut()
      },
    }),
    [session, loading, displayName]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
