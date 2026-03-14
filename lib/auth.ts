import { createHash } from 'crypto'

/**
 * Derives the session token from env vars.
 * Used by /api/auth/verify (to set the cookie).
 * Never exposed to the client.
 */
export function getSessionToken(): string {
  const passphrase = process.env.DEMO_PASSPHRASE
  const salt = process.env.DEMO_SESSION_SALT

  if (!passphrase || !salt) {
    throw new Error('DEMO_PASSPHRASE and DEMO_SESSION_SALT must be set')
  }

  return createHash('sha256')
    .update(passphrase + salt)
    .digest('hex')
}
