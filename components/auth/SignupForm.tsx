'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, Loader2, CheckCircle, User } from 'lucide-react'
import AuthInput from '@/components/auth/AuthInput'
import SocialAuthButtons from '@/components/auth/SocialAuthButtons'
import { signUpWithEmail, validateSignUp } from '@/lib/auth'

export default function SignupForm() {
  const router = useRouter()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setSuccess('')

    const validationErrors = validateSignUp({ firstName, lastName, email, password, confirmPassword })
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setErrors({})

    setLoading(true)
    const result = await signUpWithEmail({ firstName, lastName, email, password })
    setLoading(false)

    if (!result.success) {
      setFormError(result.error ?? 'Signup failed. Please try again.')
      return
    }

    if (result.session) {
      setSuccess('Account created! Redirecting...')
      router.refresh()
      setTimeout(() => router.push('/'), 1000)
    } else {
      setSuccess('Account created! Please check your email to confirm your account.')
    }
  }

  const clearError = (field: string) => {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.15, duration: 0.4 }}
      className="flex-1 flex flex-col"
    >
      <div className="text-center lg:text-left mb-8">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">Create Account</h1>
        <div className="w-12 h-px bg-accent mx-auto lg:mx-0 mb-3" />
        <p className="text-sm text-muted-foreground">Join Saree Elegance and discover timeless beauty</p>
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

      <form onSubmit={handleSubmit} className="space-y-4 flex-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AuthInput
            label="First Name"
            type="text"
            icon={User}
            placeholder="First name"
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value)
              clearError('firstName')
            }}
            error={errors.firstName}
            autoComplete="given-name"
          />
          <AuthInput
            label="Last Name"
            type="text"
            placeholder="Last name"
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value)
              clearError('lastName')
            }}
            error={errors.lastName}
            autoComplete="family-name"
          />
        </div>

        <AuthInput
          label="Email Address"
          type="email"
          icon={Mail}
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            clearError('email')
          }}
          error={errors.email}
          autoComplete="email"
        />

        <AuthInput
          label="Password"
          type={showPassword ? 'text' : 'password'}
          icon={Lock}
          placeholder="Create a password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            clearError('password')
          }}
          error={errors.password}
          autoComplete="new-password"
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

        <AuthInput
          label="Confirm Password"
          type={showConfirm ? 'text' : 'password'}
          icon={Lock}
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value)
            clearError('confirmPassword')
          }}
          error={errors.confirmPassword}
          autoComplete="new-password"
          rightElement={
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="text-muted-foreground hover:text-foreground transition p-1"
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-primary-foreground py-3.5 rounded-md font-bold tracking-widest text-sm hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              CREATING ACCOUNT...
            </>
          ) : (
            'CREATE ACCOUNT'
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
        Already have an account?{' '}
        <Link href="/login" className="font-bold text-primary hover:underline">
          Login
        </Link>
      </p>
    </motion.div>
  )
}
