import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { supabaseAnonKey, supabaseUrl } from '@/lib/supabase/config'

const AUTH_ROUTES = ['/login', '/signup']
const PROTECTED_ROUTES = ['/cart', '/checkout', '/orders', '/account']
const ADMIN_PUBLIC_ROUTES = ['/admin/login']

async function getUserRole(
  supabase: ReturnType<typeof createServerClient>,
  userId: string
): Promise<'admin' | 'customer'> {
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.error('[middleware] profile role error:', error.message)
    return 'customer'
  }

  return data?.role === 'admin' ? 'admin' : 'customer'
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  // Refresh session — critical for cookie sync after login
  await supabase.auth.getSession()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isAdminRoute = pathname.startsWith('/admin')
  const isAdminLogin = ADMIN_PUBLIC_ROUTES.some((r) => pathname.startsWith(r))

  if (isAdminRoute) {
    if (isAdminLogin) {
      if (user) {
        const role = await getUserRole(supabase, user.id)
        if (role === 'admin') {
          const url = request.nextUrl.clone()
          url.pathname = '/admin'
          url.search = ''
          return NextResponse.redirect(url)
        }
      }
      return supabaseResponse
    }

    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }

    const role = await getUserRole(supabase, user.id)
    if (role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      url.searchParams.set('error', 'unauthorized')
      return NextResponse.redirect(url)
    }

    return supabaseResponse
  }

  if (user && AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    const redirectTo = request.nextUrl.searchParams.get('redirect') || '/'
    const url = request.nextUrl.clone()
    url.pathname = redirectTo
    url.search = ''
    return NextResponse.redirect(url)
  }

  if (!user && PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
