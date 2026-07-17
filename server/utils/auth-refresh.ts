import type { H3Event } from 'h3'

interface RefreshTokenResponse {
  access_token: string
  expires_in: number
  id_token?: string
  refresh_token?: string
}

const refreshes = new Map<string, Promise<AuthSessionTokens>>()
const invalidatedRefreshes = new Set<string>()
const refreshGracePeriodMs = 5_000

export function invalidateAuthRefresh(refreshToken?: string): void {
  if (!refreshToken) return
  const refresh = refreshes.get(refreshToken)
  if (!refresh) return
  invalidatedRefreshes.add(refreshToken)
  refreshes.delete(refreshToken)
  void refresh.then(
    () => setTimeout(() => invalidatedRefreshes.delete(refreshToken), refreshGracePeriodMs),
    () => setTimeout(() => invalidatedRefreshes.delete(refreshToken), refreshGracePeriodMs)
  )
}

async function refreshAuthSession(event: H3Event, tokens: AuthSessionTokens): Promise<AuthSessionTokens> {
  const config = useRuntimeConfig(event)
  const { clientId, clientSecret, openidConfig } = config.oauth.oidc
  const tokenEndpoint = typeof openidConfig === 'object' ? openidConfig.token_endpoint : undefined
  if (!tokens.refreshToken || !clientId || !clientSecret || !tokenEndpoint) {
    throw createError({ statusCode: 401, message: 'Session expired' })
  }

  let response: RefreshTokenResponse
  try {
    response = await $fetch<RefreshTokenResponse>(tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: tokens.refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
        resource: config.apiResourceIndicator
      }).toString()
    })
  } catch (error) {
    const status = (error as { response?: { status?: number }, statusCode?: number }).response?.status
      ?? (error as { statusCode?: number }).statusCode
    if (status === 400 || status === 401) throw createError({ statusCode: 401, message: 'Session expired' })
    throw createError({ statusCode: 503, message: 'Authentication service unavailable' })
  }

  const claims = await verifyAccessToken(response.access_token, event)
  if (!hasPlatformAccess(claims)) throw createError({ statusCode: 403, message: 'Platform admin access required' })

  return {
    accessToken: response.access_token,
    accessTokenExpiresAt: claims.exp,
    idToken: response.id_token ?? tokens.idToken,
    refreshToken: response.refresh_token ?? tokens.refreshToken
  }
}

export async function getValidAuthSessionTokens(event: H3Event): Promise<AuthSessionTokens | null> {
  const tokens = await getAuthSessionTokens(event)
  if (!tokens) return null

  const now = Math.trunc(Date.now() / 1000)
  if (tokens.accessTokenExpiresAt && tokens.accessTokenExpiresAt > now + 30) return tokens
  if (!tokens.refreshToken) return null

  const key = tokens.refreshToken
  let refresh = refreshes.get(key)
  if (!refresh) {
    refresh = refreshAuthSession(event, tokens)
    refreshes.set(key, refresh)
    void refresh.then(
      () => setTimeout(() => refreshes.delete(key), refreshGracePeriodMs),
      () => refreshes.delete(key)
    )
  }
  const refreshed = await refresh
  if (invalidatedRefreshes.has(key)) throw createError({ statusCode: 401, message: 'Session expired' })
  await setUserSession(event, { secure: refreshed })
  return refreshed
}
