import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Redirect authenticated users away from auth pages
  if (path === '/login' || path === '/register') {
    const token = request.cookies.get('auth_token')?.value
    if (token) {
      const payload = await verifyToken(token)
      if (payload) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
    return NextResponse.next()
  }

  // Protect dashboard, profile, admin, and API routes
  if (path.startsWith('/dashboard') || path.startsWith('/profile') || path.startsWith('/admin') || path.startsWith('/api')) {
    // Exclude public API routes
    if (path === '/api/auth/login' || path === '/api/auth/register' || path === '/api/auth/logout') {
      return NextResponse.next()
    }

    const token = request.cookies.get('auth_token')?.value
    
    if (!token) {
      if (path.startsWith('/api')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const payload = await verifyToken(token)
    if (!payload) {
      if (path.startsWith('/api')) {
        return NextResponse.json({ error: 'Invalid Token' }, { status: 401 })
      }
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('auth_token')
      return response
    }

    // Check Admin Role
    if (path.startsWith('/admin') && payload.role !== 'ADMIN') {
        // API admin routes return 403, pages redirect
        if (path.startsWith('/api')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    
    // Pass user info via headers
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', payload.userId as string)
    requestHeaders.set('x-user-role', payload.role as string || 'USER')
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*', '/login', '/register', '/admin/:path*', '/api/:path*'],
}
