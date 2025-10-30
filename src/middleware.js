import { NextResponse } from 'next/server'

export function middleware(request) {
  // Get the pathname of the request (e.g. /, /dashboard, /auth/signin)
  const path = request.nextUrl.pathname

  // Define paths that require authentication
  const protectedPaths = [
    '/dashboard',
    '/skill-audit',
    '/career-path',
    '/roadmap',
    '/projects',
    '/mentor',
    '/settings'
  ]

  // Define public paths that don't require authentication
  const publicPaths = [
    '/',
    '/auth/signin',
    '/auth/signup',
    '/auth/reset-password'
  ]

  // Check if the path is protected
  const isProtectedPath = protectedPaths.some(protectedPath => 
    path.startsWith(protectedPath)
  )

  // Check if the path is public
  const isPublicPath = publicPaths.some(publicPath => 
    path === publicPath || path.startsWith('/api/')
  )

  // Get the token from cookies (you might need to adjust this based on your auth implementation)
  const token = request.cookies.get('auth-token')?.value

  // If it's a protected path and there's no token, redirect to signin
  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (token && (path === '/auth/signin' || path === '/auth/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}