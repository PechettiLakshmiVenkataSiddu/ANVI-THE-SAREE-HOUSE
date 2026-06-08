import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { signInWithEmail, signOut, type AuthResult } from '@/lib/auth'
import type { ProfileRole } from '@/lib/types/admin'

/** Ensure the browser client has an active session before RLS-protected queries */
export async function establishSession(session: Session): Promise<boolean> {
  const { error } = await supabase.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  })
  if (error) {
    console.error('[admin/auth] setSession failed:', error.message)
    return false
  }
  return true
}

export async function getProfileRole(userId: string): Promise<ProfileRole> {
  try {
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      console.error('[admin/auth] No active session when fetching role for:', userId)
      return 'customer'
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      console.error('[admin/auth] Profile fetch error:', error.message, error.code)
      return 'customer'
    }

    if (!data) {
      console.error('[admin/auth] No profile row for user:', userId)
      return 'customer'
    }

    return data.role === 'admin' ? 'admin' : 'customer'
  } catch (e) {
    console.error('[admin/auth] Exception fetching profile role:', e)
    return 'customer'
  }
}

/** Retry role fetch — session cookies may need a moment after sign-in */
export async function getProfileRoleWithRetry(userId: string, maxAttempts = 4): Promise<ProfileRole> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const role = await getProfileRole(userId)
    if (role === 'admin') return 'admin'

    if (attempt < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 150 * attempt))
    }
  }
  return 'customer'
}

export async function isAdminUser(user: User | null): Promise<boolean> {
  if (!user) return false

  const role = await getProfileRoleWithRetry(user.id)
  if (role === 'admin') return true

  // Fallback: metadata set at signup (until profiles row syncs)
  return user.user_metadata?.role === 'admin'
}

export async function adminSignIn(email: string, password: string): Promise<AuthResult & { isAdmin?: boolean }> {
  const result = await signInWithEmail(email, password)

  if (!result.success || !result.user || !result.session) {
    return result.success
      ? { success: false, error: 'Login succeeded but no session was returned. Please try again.' }
      : result
  }

  const sessionOk = await establishSession(result.session)
  if (!sessionOk) {
    return { success: false, error: 'Could not establish session. Please try again.' }
  }

  const { data: { user: verifiedUser }, error: userError } = await supabase.auth.getUser()
  if (userError || !verifiedUser) {
    console.error('[admin/auth] getUser after sign-in failed:', userError?.message)
    return { success: false, error: 'Authentication verification failed. Please try again.' }
  }

  const admin = await isAdminUser(verifiedUser)
  if (!admin) {
    await signOut()
    return { success: false, error: 'Access denied. Admin credentials required.' }
  }

  return { ...result, user: verifiedUser, isAdmin: true }
}

export async function fetchProfile(userId: string) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
  return { data, error }
}
