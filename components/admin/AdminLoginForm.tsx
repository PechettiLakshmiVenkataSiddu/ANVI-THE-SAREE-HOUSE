'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, Loader2, Shield } from 'lucide-react'
import { adminSignIn } from '@/lib/admin/auth'
import { validateEmail, validatePassword } from '@/lib/auth'

export default function AdminLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (searchParams.get('error') === 'unauthorized') {
      setError('Access denied. Admin credentials required.')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const emailErr = validateEmail(email)
    const passErr = validatePassword(password)
    if (emailErr || passErr) {
      setError(emailErr ?? passErr ?? 'Invalid credentials')
      return
    }

    setLoading(true)
    const result = await adminSignIn(email, password)
    setLoading(false)

    if (!result.success) {
      setError(result.error ?? 'Login failed')
      return
    }

    const redirect = searchParams.get('redirect') || '/admin'
    router.push(redirect)
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#1a1410] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-xl border border-border shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-primary/10 rounded-full mb-4">
            <Shield size={28} className="text-primary" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Admin Login</h1>
          <p className="text-sm text-muted-foreground mt-2">Saree Elegance Dashboard</p>
        </div>

        {error && (
          <div className="mb-4 text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-md px-4 py-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold tracking-widest text-muted-foreground uppercase">Email</label>
            <div className="relative mt-1.5">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-border rounded-md bg-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="admin@sareeelegance.com"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold tracking-widest text-muted-foreground uppercase">Password</label>
            <div className="relative mt-1.5">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-border rounded-md bg-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-md font-bold tracking-widest text-sm hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 size={18} className="animate-spin" /> SIGNING IN...</> : 'SIGN IN'}
          </button>
        </form>
      </div>
    </div>
  )
}
