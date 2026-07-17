/**
 * Clears the local session when its server-only access token has expired.
 */
export default defineEventHandler(async (event) => {
  // Only validate on page requests (SSR), not on API/auth routes
  if (event.path.startsWith('/api/') || event.path.startsWith('/auth/') || event.path.startsWith('/_nuxt/')) return

  try {
    const tokens = await getValidAuthSessionTokens(event)
    if (!tokens && (await getAuthSessionTokens(event))) await clearAuthSession(event)
  } catch (error) {
    const statusCode = (error as { statusCode?: number }).statusCode
    if (statusCode === 401 || statusCode === 403) await clearAuthSession(event)
  }
})
