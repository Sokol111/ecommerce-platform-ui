import type { H3Event } from 'h3'

export async function useAuthToken(event: H3Event): Promise<string> {
  try {
    const token = (await getValidAuthSessionTokens(event))?.accessToken
    if (token) return token
  } catch (error) {
    const statusCode = (error as { statusCode?: number }).statusCode
    if (statusCode === 401 || statusCode === 403) await clearAuthSession(event)
    throw error
  }

  await clearAuthSession(event)
  throw createError({ statusCode: 401, message: 'Not authenticated' })
}
