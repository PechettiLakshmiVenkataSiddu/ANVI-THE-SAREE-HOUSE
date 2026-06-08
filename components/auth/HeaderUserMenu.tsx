'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User, LogOut, Loader2 } from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'

export default function HeaderUserMenu() {
  const { isAuthenticated, loading, signOut, displayName } = useAuth()
  const [open, setOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    setLoggingOut(true)
    await signOut()
    setOpen(false)
    router.push('/login')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="p-2 hidden sm:flex items-center justify-center" aria-hidden>
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <Link
        href="/login"
        className="p-2 hover:bg-secondary rounded-full transition hidden sm:block"
        aria-label="Login"
      >
        <User size={20} />
      </Link>
    )
  }

  return (
    <div ref={menuRef} className="relative hidden sm:block">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="p-2 hover:bg-secondary rounded-full transition"
        aria-label="Account menu"
        aria-expanded={open}
      >
        <User size={20} />
      </button>

      {open && (
        <div className="absolute right-0 top-full pt-2 w-44 z-50">
          <div className="bg-card border border-border rounded-md shadow-lg py-1">
            <div className="px-4 py-2 border-b border-border">
              <p className="text-xs font-medium text-foreground truncate">{displayName}</p>
            </div>
            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 hover:bg-secondary text-sm"
            >
              My Account
            </Link>
            <Link
              href="/orders"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 hover:bg-secondary text-sm"
            >
              My Orders
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full text-left px-4 py-2 hover:bg-secondary text-sm flex items-center gap-2 disabled:opacity-60"
            >
              {loggingOut ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <LogOut size={14} className="text-destructive" />
              )}
              <span className={loggingOut ? '' : 'text-destructive'}>
                {loggingOut ? 'Logging out...' : 'Logout'}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
