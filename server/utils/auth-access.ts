export const PLATFORM_ADMIN_ROLE = 'platform_manager'

export interface PlatformAccessClaims {
  role?: string
  tenant?: string
  scope?: string
}

export function hasPlatformAccess(claims: PlatformAccessClaims): boolean {
  if (claims.tenant || claims.role !== PLATFORM_ADMIN_ROLE) return false

  const scopes = new Set(claims.scope?.split(' ').filter(Boolean))
  return scopes.has('tenants:read')
}

export function hasPlatformApiPermission(claims: PlatformAccessClaims, method: string, path: string): boolean {
  const action = ({ DELETE: 'delete', PATCH: 'write', POST: 'write', PUT: 'write' } as Record<string, string>)[method]
  if (!action || !path.startsWith('/api/tenants')) return true
  return new Set(claims.scope?.split(' ').filter(Boolean)).has(`tenants:${action}`)
}
