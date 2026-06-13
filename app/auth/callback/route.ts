import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

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
