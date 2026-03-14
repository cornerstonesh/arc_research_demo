import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { getSessionToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  let body: { passphrase?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { passphrase } = body
  if (!passphrase || typeof passphrase !== 'string') {
    return NextResponse.json({ error: 'Passphrase required' }, { status: 400 })
  }

  const expected = Buffer.from(process.env.DEMO_PASSPHRASE ?? '')
  const provided = Buffer.from(passphrase)

  // Constant-time comparison to prevent timing attacks
  const match =
    expected.length === provided.length &&
    timingSafeEqual(expected, provided)

  if (!match) {
    return NextResponse.json({ error: 'Invalid passphrase' }, { status: 401 })
  }

  const token = getSessionToken()
  const response = NextResponse.json({ ok: true })

  response.cookies.set('demo_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })

  return response
}
