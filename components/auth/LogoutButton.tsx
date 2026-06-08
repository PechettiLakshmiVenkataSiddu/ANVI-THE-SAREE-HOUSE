'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Loader2 } from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'

interface LogoutButtonProps {
  className?: string
  redirectTo?: string
}

export default function LogoutButton({ className = '', redirectTo = '/login' }: LogoutButtonProps) {
  const { signOut } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    await signOut()
    router.push(redirectTo)
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={`flex items-center justify-center gap-2 px-4 py-2.5 border border-border rounded-md text-sm font-semibold hover:bg-secondary transition disabled:opacity-60 ${className}`}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
      {loading ? 'Logging out...' : 'Logout'}
    </button>
  )
}
