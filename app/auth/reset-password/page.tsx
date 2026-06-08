'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import AuthLayout from '@/components/auth/AuthLayout'
import AuthInput from '@/components/auth/AuthInput'
import { Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { validatePassword } from '@/lib/auth'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const passwordError = validatePassword(password)
    if (passwordError) {
      setError(passwordError)
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    router.push('/login?message=password_updated')
  }

  return (
    <AuthLayout>
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
        <div className="text-center lg:text-left mb-8">
          <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Reset Password</h1>
          <div className="w-12 h-px bg-accent mx-auto lg:mx-0 mb-3" />
          <p className="text-sm text-muted-foreground">Enter your new password below</p>
        </div>

        {error && (
          <div className="mb-4 text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-md px-4 py-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthInput
            label="New Password"
            type="password"
            icon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
          <AuthInput
            label="Confirm Password"
            type="password"
            icon={Lock}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3.5 rounded-md font-bold tracking-widest text-sm hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                UPDATING...
              </>
            ) : (
              'UPDATE PASSWORD'
            )}
          </button>
        </form>
      </div>
    </AuthLayout>
  )
}
