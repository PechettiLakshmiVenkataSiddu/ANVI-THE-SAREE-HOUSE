import type { AuthError, Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export type UserRole = 'customer' | 'admin'

export interface AuthResult {
  success: boolean
  error?: string
  user?: User | null
  session?: Session | null
}

export interface SignUpData {
  email: string
  password: string
  firstName: string
  lastName: string
}

function formatAuthError(error: AuthError | null): string {
  if (!error) return 'Something went wrong. Please try again.'
  if (error.message.includes('Invalid login credentials')) {
    return 'Invalid email or password. Please try again.'
  }
  if (error.message.includes('User already registered')) {
    return 'An account with this email already exists.'
  }
  if (error.message.includes('Password should be at least')) {
    return 'Password must be at least 6 characters long.'
  }
  return error.message
}

export function validateEmail(email: string): string | null {
  if (!email.trim()) return 'Email is required.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Please enter a valid email address.'
  return null
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Password is required.'
  if (password.length < 6) return 'Password must be at least 6 characters.'
  return null
}

export function validateSignUp(data: SignUpData & { confirmPassword: string }): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!data.firstName.trim()) errors.firstName = 'First name is required.'
  if (!data.lastName.trim()) errors.lastName = 'Last name is required.'
  const emailError = validateEmail(data.email)
  if (emailError) errors.email = emailError
  const passwordError = validatePassword(data.password)
  if (passwordError) errors.password = passwordError
  if (data.password !== data.confirmPassword) errors.confirmPassword = 'Passwords do not match.'
  return errors
}

export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  })

  if (error) {
    return { success: false, error: formatAuthError(error) }
  }

  return { success: true, user: data.user, session: data.session }
}

export async function signUpWithEmail(formData: SignUpData): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signUp({
    email: formData.email.trim(),
    password: formData.password,
    options: {
      data: {
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        full_name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        role: 'customer' satisfies UserRole,
      },
    },
  })

  if (error) {
    return { success: false, error: formatAuthError(error) }
  }

  return { success: true, user: data.user, session: data.session }
}

export async function signOut(): Promise<AuthResult> {
  const { error } = await supabase.auth.signOut()

  if (error) {
    return { success: false, error: formatAuthError(error) }
  }

  return { success: true }
}

export async function signInWithOAuth(provider: 'google' | 'facebook'): Promise<AuthResult> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  if (error) {
    return { success: false, error: formatAuthError(error) }
  }

  return { success: true }
}

export async function resetPassword(email: string): Promise<AuthResult> {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  })

  if (error) {
    return { success: false, error: formatAuthError(error) }
  }

  return { success: true }
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error) return { session: null, user: null, error: formatAuthError(error) }
  return { session: data.session, user: data.session?.user ?? null, error: null }
}

export async function getUserRole(user: User | null): Promise<UserRole> {
  if (!user) return 'customer'

  try {
    console.log('getUserRole: Fetching role for user:', user.id)
    const { data, error } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
    if (error) {
      console.error('getUserRole: Error fetching role:', error)
      console.error('getUserRole: Error details:', JSON.stringify(error, null, 2))
    } else if (data) {
      console.log('getUserRole: Role from profiles:', data.role)
      if (data.role === 'admin') return 'admin'
      if (data.role === 'customer') return 'customer'
    } else {
      console.log('getUserRole: No data found for user:', user.id)
    }
  } catch (e) {
    console.error('getUserRole: Exception:', e)
    // profiles table may not exist yet — fall back to metadata
  }

  const role = user.user_metadata?.role as UserRole | undefined
  console.log('getUserRole: Falling back to user_metadata.role:', role)
  return role === 'admin' ? 'admin' : 'customer'
}

export function getUserDisplayName(user: User | null): string {
  if (!user) return 'Guest'
  return (
    user.user_metadata?.full_name ||
    `${user.user_metadata?.first_name ?? ''} ${user.user_metadata?.last_name ?? ''}`.trim() ||
    user.email?.split('@')[0] ||
    'User'
  )
}
