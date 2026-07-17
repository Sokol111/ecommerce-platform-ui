import type { H3Event } from 'h3'

export interface AuthSessionTokens {
  accessToken: string
  accessTokenExpiresAt?: number
  idToken?: string
  refreshToken?: string
}

export async function getAuthSessionTokens(event: H3Event): Promise<AuthSessionTokens | null> {
  const session = await getUserSession(event).catch(() => null)
  return session?.secure as AuthSessionTokens | undefined ?? null
}

export async function clearAuthSession(event: H3Event): Promise<void> {
  await clearUserSession(event).catch(() => {})
}
