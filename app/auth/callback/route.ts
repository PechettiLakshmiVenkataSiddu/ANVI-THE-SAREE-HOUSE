import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function getRequestOrigin(request: Request): string {
  const originHeader = request.headers.get('origin')
  if (originHeader) return originHeader.replace(/\/$/, '')

  const forwardedHost = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim()
  const host = forwardedHost || request.headers.get('host')
  if (host) {
    const forwardedProto = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim()
    const proto = forwardedProto || (host.includes('localhost') ? 'http' : 'https')
    return `${proto}://${host}`
  }

  return new URL(request.url).origin
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const origin = getRequestOrigin(request)
  const code = searchParams.get('code')
  let next = searchParams.get('next') ?? '/'
  if (!next.startsWith('/') || next.startsWith('//')) next = '/'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data.user) {
      // Ensure profile exists for OAuth users (Google, etc.)
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          email: data.user.email,
          first_name: data.user.user_metadata?.first_name ||
                       data.user.user_metadata?.given_name ||
                       data.user.user_metadata?.name?.split(' ')[0] ||
                       '',
          last_name: data.user.user_metadata?.last_name ||
                      data.user.user_metadata?.family_name ||
                      (data.user.user_metadata?.name?.split(' ').slice(1).join(' ') || ''),
          role: data.user.user_metadata?.role || 'customer',
        }, {
          onConflict: 'id'
        })

      if (profileError) {
        console.error('Error upserting profile:', profileError)
      }

      // Check if profile completion is needed (only for OAuth users who haven't completed it)
      const { data: profile } = await supabase
        .from('profiles')
        .select('profile_completed')
        .eq('id', data.user.id)
        .single()

      // If profile is not completed and this is an OAuth user (no password), redirect to profile completion
      if (profile && !profile.profile_completed && !data.user.user_metadata?.password) {
        return NextResponse.redirect(`${origin}/complete-profile?next=${encodeURIComponent(next)}`)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
