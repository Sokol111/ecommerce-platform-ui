import type { H3Event } from 'h3'
import { clearUserSession, getUserSession } from 'nuxt-oidc-auth/runtime/server/utils/session.js'

export async function useAuthToken(event: H3Event): Promise<string> {
  const session = await getUserSession(event).catch(() => null)
  const token = session?.accessToken
  if (!token) {
    await clearUserSession(event).catch(() => {})
    throw createError({ statusCode: 401, message: 'Not authenticated' })
  }
  return token as string
}
