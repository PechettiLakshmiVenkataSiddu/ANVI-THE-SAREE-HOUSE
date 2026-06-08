'use client'

import { createContext, useContext, useEffect, useState, useCallback, useMemo, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { getUserDisplayName, getUserRole, signOut as authSignOut, type UserRole } from '@/lib/auth'
import type { CustomerInfo } from '@/lib/types/auth'

interface AuthContextType {
  user: User | null
  session: Session | null
  role: UserRole
  displayName: string
  customer: CustomerInfo | null
  isAuthenticated: boolean
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function buildCustomer(user: User | null, role: UserRole): CustomerInfo | null {
  if (!user) return null
  return {
    id: user.id,
    email: user.email ?? '',
    displayName: getUserDisplayName(user),
    firstName: (user.user_metadata?.first_name as string) ?? '',
    lastName: (user.user_metadata?.last_name as string) ?? '',
    role,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [role, setRole] = useState<UserRole>('customer')
  const [loading, setLoading] = useState(true)

  const applySession = useCallback(async (newSession: Session | null) => {
    setSession(newSession)
    const nextUser = newSession?.user ?? null
    setUser(nextUser)
    const nextRole = await getUserRole(nextUser)
    setRole(nextRole)
    setLoading(false)
  }, [])

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession()
      await applySession(data.session)
    }

    init()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      await applySession(newSession)
    })

    return () => subscription.unsubscribe()
  }, [applySession])

  const signOut = useCallback(async () => {
    await authSignOut()
    setUser(null)
    setSession(null)
    setRole('customer')
  }, [])

  const customer = useMemo(() => buildCustomer(user, role), [user, role])
  const isAuthenticated = !!user && !!session
  const displayName = getUserDisplayName(user)

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        role,
        displayName,
        customer,
        isAuthenticated,
        loading,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
