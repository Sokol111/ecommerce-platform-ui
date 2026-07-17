import type { JWTPayload } from 'jose'
import { createRemoteJWKSet, jwtVerify } from 'jose'

export interface AccessTokenClaims extends JWTPayload {
  role?: string
  tenant?: string
  scope?: string
}

export interface IdTokenClaims extends JWTPayload {
  azp?: string
  email?: string
  name?: string
  given_name?: string
  family_name?: string
}

const remoteJwks = new Map<string, ReturnType<typeof createRemoteJWKSet>>()

export interface TokenValidationConfig {
  audience: string
  issuer: string
  jwksUrl: string
}

function getJwks(url: string) {
  let jwks = remoteJwks.get(url)
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(url))
    remoteJwks.set(url, jwks)
  }
  return jwks
}

export async function verifyTokenWithConfig<T extends JWTPayload>(token: string, config: TokenValidationConfig): Promise<T> {
  try {
    const { payload } = await jwtVerify(token, getJwks(config.jwksUrl), {
      algorithms: ['ES256', 'ES384', 'RS256'],
      audience: config.audience,
      issuer: config.issuer,
      requiredClaims: ['exp', 'iat', 'sub']
    })
    return payload as T
  } catch (error) {
    const code = (error as { code?: string }).code
    if (code === 'ERR_JWKS_TIMEOUT') {
      throw createError({ statusCode: 503, message: 'Authentication service unavailable' })
    }
    if (code?.startsWith('ERR_')) {
      throw createError({ statusCode: 401, message: 'Invalid token' })
    }
    throw error
  }
}

function getAuthConfig(event?: Parameters<typeof useRuntimeConfig>[0]) {
  const config = useRuntimeConfig(event)
  if (!config.oidcIssuer || !config.oidcJwksUrl || !config.apiResourceIndicator) {
    throw createError({ statusCode: 500, message: 'OIDC token validation is not configured' })
  }
  return config
}

export async function verifyAccessToken(token: string, event?: Parameters<typeof useRuntimeConfig>[0]): Promise<AccessTokenClaims> {
  const config = getAuthConfig(event)
  return verifyTokenWithConfig<AccessTokenClaims>(token, {
    audience: config.apiResourceIndicator,
    issuer: config.oidcIssuer,
    jwksUrl: config.oidcJwksUrl
  })
}

export async function verifyIdToken(token: string, event?: Parameters<typeof useRuntimeConfig>[0]): Promise<IdTokenClaims> {
  const config = getAuthConfig(event)
  const clientId = config.oauth.oidc.clientId
  if (!clientId) throw createError({ statusCode: 500, message: 'OIDC client ID is not configured' })

  const claims = await verifyTokenWithConfig<IdTokenClaims>(token, {
    audience: clientId,
    issuer: config.oidcIssuer,
    jwksUrl: config.oidcJwksUrl
  })
  if (Array.isArray(claims.aud) && claims.aud.length > 1 && claims.azp !== clientId) {
    throw createError({ statusCode: 401, message: 'Invalid ID token authorized party' })
  }
  return claims
}
