import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This middleware checks if the app is configured
// If not, it redirects to the config page
export function middleware(request: NextRequest) {
  // Debug middleware execution
  console.log('Middleware running for path:', request.nextUrl.pathname);
  
  // Skip middleware for API routes, the config page itself, and static assets
  if (
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.startsWith('/config') ||
    request.nextUrl.pathname.includes('_next') ||
    request.nextUrl.pathname.includes('favicon.ico') ||
    request.nextUrl.pathname.endsWith('.svg') ||
    request.nextUrl.pathname.endsWith('.png') ||
    request.nextUrl.pathname.endsWith('.jpg') ||
    request.nextUrl.pathname.endsWith('.ico')
  ) {
    console.log('Skipping middleware for excluded path');
    return NextResponse.next();
  }

  // Check if configuration exists in cookies
  const configSet = request.cookies.get('config-set')?.value;
  console.log('Config cookie value:', configSet);

  // If configuration is not set, redirect to config page
  if (!configSet || configSet !== 'true') {
    console.log('Redirecting to config page');
    return NextResponse.redirect(new URL('/config', request.url));
  }

  console.log('Config detected, proceeding normally');
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api routes
     * 2. /_next/static (static files)
     * 3. /_next/image (image optimization files)
     * 4. /favicon.ico (favicon file)
     * 5. /config (config page)
     */
    '/((?!api|_next/static|_next/image|config|favicon.ico).*)',
  ],
};
