interface TokenCache {
  token: string
  expiresAt: number
}

let tokenCache: TokenCache | null = null

/**
 * Get a M2M access token from Logto via client_credentials grant.
 * Cached until 30s before expiry.
 */
export async function getS2SToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token
  }

  const { logtoUrl, logtoClientId, logtoClientSecret, apiResourceIndicator } = useRuntimeConfig()
  const tokenUrl = `${logtoUrl}/oidc/token`

  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: logtoClientId,
    client_secret: logtoClientSecret,
    resource: apiResourceIndicator,
    scope: 'tenants:read tenants:write'
  })

  const resp = await $fetch<{ access_token: string, expires_in: number }>(
    tokenUrl,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    }
  )

  tokenCache = {
    token: resp.access_token,
    expiresAt: Date.now() + (resp.expires_in - 30) * 1000
  }

  return resp.access_token
}
