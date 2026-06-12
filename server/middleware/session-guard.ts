import { clearUserSession, getUserSession } from 'nuxt-oidc-auth/runtime/server/utils/session.js'

/**
 * Validates the session on page requests (SSR).
 * If the access token is expired or malformed, clears the session cookie
 * so the client-side auth middleware sees loggedIn=false and redirects to /login.
 */
export default defineEventHandler(async (event) => {
  // Only validate on page requests (SSR), not on API/auth routes
  if (event.path.startsWith('/api/') || event.path.startsWith('/auth/') || event.path.startsWith('/_nuxt/')) return

  const session = await getUserSession(event).catch(() => null)
  const token = session?.accessToken as string | undefined
  if (!token) return

  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1]!, 'base64url').toString())
    const now = Math.trunc(Date.now() / 1000)
    if (payload.exp && payload.exp <= now) {
      await clearUserSession(event)
    }
  } catch {
    // Malformed token — clear session
    await clearUserSession(event)
  }
})
