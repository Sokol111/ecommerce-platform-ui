interface TokenCache {
  token: string
  expiresAt: number
}

let tokenCache: TokenCache | null = null

/**
 * Get an access token for Zitadel APIs via client_credentials grant.
 * Cached until 30s before expiry.
 */
export async function getS2SToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token
  }

  const { zitadelUrl, zitadelClientId, zitadelClientSecret } = useRuntimeConfig()

  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: zitadelClientId,
    client_secret: zitadelClientSecret,
    scope: 'openid urn:zitadel:iam:org:project:id:zitadel:aud'
  })

  const resp = await $fetch<{ access_token: string, expires_in: number }>(
    '/oauth/v2/token',
    {
      baseURL: zitadelUrl,
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

function authHeaders(token: string) {
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
}

export function useZitadelClient() {
  const { zitadelUrl, zitadelProjectId } = useRuntimeConfig()

  return {
    async createUser(opts: {
      email: string
      password: string
      firstName: string
      lastName: string
      tenantSlug: string
    }) {
      const token = await getS2SToken()

      // Create user with tenant metadata in a single call.
      const resp = await $fetch<{ id: string }>('/v2/users/new', {
        baseURL: zitadelUrl,
        method: 'POST',
        headers: authHeaders(token),
        body: {
          username: opts.email,
          human: {
            profile: {
              givenName: opts.firstName,
              familyName: opts.lastName
            },
            email: {
              email: opts.email,
              isVerified: true
            },
            password: {
              password: opts.password,
              changeRequired: false
            }
          },
          metadata: [
            {
              key: 'tenant',
              value: btoa(opts.tenantSlug)
            }
          ]
        }
      })

      return resp.id
    },

    async grantRole(userId: string, role: string) {
      const token = await getS2SToken()

      await $fetch('/zitadel.authorization.v2.AuthorizationService/CreateAuthorization', {
        baseURL: zitadelUrl,
        method: 'POST',
        headers: {
          ...authHeaders(token),
          'Connect-Protocol-Version': '1'
        },
        body: {
          userId,
          projectId: zitadelProjectId,
          roleKeys: [role]
        }
      })
    }
  }
}
