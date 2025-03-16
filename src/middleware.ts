import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define which paths should be accessible without configuration
const publicPaths = ['/settings']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow access to public paths regardless of configuration
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Get configuration from cookies
  const configVerified = request.cookies.get('config_verified')?.value

  // If configuration is not verified, redirect to settings
  if (configVerified !== 'true') {
    const url = new URL('/settings', request.url)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

// Configure which paths should be checked by the middleware
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
