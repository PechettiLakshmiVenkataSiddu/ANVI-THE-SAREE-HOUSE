'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react'
import AuthInput from '@/components/auth/AuthInput'
import SocialAuthButtons from '@/components/auth/SocialAuthButtons'
import { signInWithEmail, validateEmail, validatePassword, resetPassword } from '@/lib/auth'

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)

  useEffect(() => {
    const message = searchParams.get('message')
    const error = searchParams.get('error')

    if (message === 'password_updated') {
      setSuccess('Password updated successfully. You can now log in.')
    }
    if (error === 'auth_callback_failed') {
      setFormError('Social login failed. Please try again or use email login.')
    }
  }, [searchParams])

  const validate = () => {
    const newErrors: Record<string, string> = {}
    const emailError = validateEmail(email)
    if (emailError) newErrors.email = emailError
    const passwordError = validatePassword(password)
    if (passwordError) newErrors.password = passwordError
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setSuccess('')
    if (!validate()) return

    setLoading(true)
    const result = await signInWithEmail(email, password)
    setLoading(false)

    if (!result.success) {
      setFormError(result.error ?? 'Login failed. Please try again.')
      return
    }

    if (!result.session) {
      setFormError('Login succeeded but no session was created. Please try again.')
      return
    }

    setSuccess('Welcome back! Redirecting...')
    router.refresh()
    setTimeout(() => router.push(redirectTo), 800)
  }

  const handleForgotPassword = async () => {
    setFormError('')
    setSuccess('')
    const emailError = validateEmail(email)
    if (emailError) {
      setErrors({ email: emailError })
      return
    }
    setResetLoading(true)
    const result = await resetPassword(email)
    setResetLoading(false)
    if (!result.success) {
      setFormError(result.error ?? 'Could not send reset email.')
      return
    }
    setSuccess('Password reset link sent to your email.')
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.15, duration: 0.4 }}
      className="flex-1 flex flex-col"
    >
      <div className="text-center lg:text-left mb-8">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">Welcome Back</h1>
        <div className="w-12 h-px bg-accent mx-auto lg:mx-0 mb-3" />
        <p className="text-sm text-muted-foreground">Login to your account and continue your saree journey</p>
      </div>

      {formError && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-md px-4 py-3"
        >
          {formError}
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-4 py-3 flex items-center gap-2"
        >
          <CheckCircle size={16} />
          {success}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 flex-1">
        <AuthInput
          label="Email Address"
          type="email"
          icon={Mail}
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (errors.email) setErrors((prev) => ({ ...prev, email: '' }))
          }}
          error={errors.email}
          autoComplete="email"
        />

        <div>
          <AuthInput
            label="Password"
            type={showPassword ? 'text' : 'password'}
            icon={Lock}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (errors.password) setErrors((prev) => ({ ...prev, password: '' }))
            }}
            error={errors.password}
            autoComplete="current-password"
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-foreground transition p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
          />
          <div className="flex justify-end mt-2">
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={resetLoading}
              className="text-xs font-semibold text-primary hover:text-primary/80 transition disabled:opacity-50"
            >
              {resetLoading ? 'Sending...' : 'Forgot Password?'}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-primary-foreground py-3.5 rounded-md font-bold tracking-widest text-sm hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              LOGGING IN...
            </>
          ) : (
            'LOGIN'
          )}
        </button>
      </form>

      <div className="my-6 flex items-center gap-4">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground font-medium">OR</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <SocialAuthButtons />

      <p className="text-center text-sm text-muted-foreground mt-8">
        New to Saree Elegance?{' '}
        <Link href="/signup" className="font-bold text-primary hover:underline">
          Create an Account
        </Link>
      </p>
    </motion.div>
  )
}
