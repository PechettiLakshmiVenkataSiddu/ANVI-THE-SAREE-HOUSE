'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'

/**
 * Client-side auth guard for components that need the current customer.
 * Redirects to /login when unauthenticated (middleware is the primary guard).
 */
export function useRequireAuth() {
  const auth = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!auth.loading && !auth.isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`)
    }
  }, [auth.loading, auth.isAuthenticated, router, pathname])

  return auth
}
