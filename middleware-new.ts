import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/account/:path*',
    '/cart/:path*',
    '/checkout/:path*',
    '/orders/:path*',
    '/admin/:path*',
  ],
}