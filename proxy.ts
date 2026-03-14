import { NextRequest, NextResponse } from 'next/server'

// Edge runtime doesn't support Node's crypto module — use Web Crypto API instead
async function getSessionToken(): Promise<string> {
  const passphrase = process.env.DEMO_PASSPHRASE ?? ''
  const salt = process.env.DEMO_SESSION_SALT ?? ''
  const data = new TextEncoder().encode(passphrase + salt)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Constant-time string comparison for the Edge runtime.
 * `timingSafeEqual` from Node's `crypto` is not available in Edge,
 * so we use a pure-JS XOR approach instead.
 */
function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public paths — no auth required
  // _next/static and _next/image are excluded because they serve build assets,
  // not pages — excluding them is not a security gap.
  if (
    pathname === '/login' ||
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/_next/') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  const cookie = request.cookies.get('demo_session')
  const expected = await getSessionToken()

  if (!cookie || !safeCompare(cookie.value, expected)) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
