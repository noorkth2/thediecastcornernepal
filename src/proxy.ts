import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  // ── Content Security Policy (CSP) & Nonce ─────────────────────────────────
  const nonce = crypto.randomUUID()

  const cspHeader = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-inline' 'unsafe-eval' https://platform.twitter.com https://connect.facebook.net`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `font-src 'self' https://fonts.gstatic.com`,
    `img-src 'self' data: https:`,
    `frame-ancestors 'self'`,
  ].join('; ')

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)

  let supabaseResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // ── Supabase Server Client ────────────────────────────────────────────────
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — must call getUser() to keep session alive
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // ── Protect auth routes — redirect logged-in users ─────────────────────────
  if (user && (path.startsWith('/login') || path.startsWith('/register'))) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role === 'admin') {
      const redirectResponse = NextResponse.redirect(new URL('/admin', request.url))
      redirectResponse.headers.set('Content-Security-Policy', cspHeader)
      return redirectResponse
    }
    const redirectResponse = NextResponse.redirect(new URL('/', request.url))
    redirectResponse.headers.set('Content-Security-Policy', cspHeader)
    return redirectResponse
  }

  // ── Protect /account routes — must be logged in ──────────────────────────
  if ((path.startsWith('/account') || path.startsWith('/checkout')) && !user) {
    const redirectResponse = NextResponse.redirect(
      new URL(`/login?redirect=${encodeURIComponent(path)}`, request.url)
    )
    redirectResponse.headers.set('Content-Security-Policy', cspHeader)
    return redirectResponse
  }

  // ── Protect /admin routes — must be admin role ────────────────────────────
  if (path.startsWith('/admin')) {
    if (!user) {
      const redirectResponse = NextResponse.redirect(new URL('/login', request.url))
      redirectResponse.headers.set('Content-Security-Policy', cspHeader)
      return redirectResponse
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      const redirectResponse = NextResponse.redirect(new URL('/', request.url))
      redirectResponse.headers.set('Content-Security-Policy', cspHeader)
      return redirectResponse
    }
  }

  supabaseResponse.headers.set('Content-Security-Policy', cspHeader)
  return supabaseResponse
}

export const config = {
  matcher: [
    '/account/:path*',
    '/admin/:path*',
    // Refresh session on all routes except static/api/auth
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
}

