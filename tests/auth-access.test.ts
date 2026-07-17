import { describe, expect, it } from 'vitest'
import { hasPlatformAccess, hasPlatformApiPermission } from '../server/utils/auth-access'

const platformManager = {
  role: 'platform_manager',
  scope: 'tenants:read tenants:write tenants:delete'
}

describe('platform access', () => {
  it('accepts a tenantless platform manager', () => {
    expect(hasPlatformAccess(platformManager)).toBe(true)
  })

  it('rejects tenant admins and tenant-scoped platform managers', () => {
    expect(hasPlatformAccess({ role: 'super_admin', scope: 'tenants:read' })).toBe(false)
    expect(hasPlatformAccess({ ...platformManager, tenant: 'shop' })).toBe(false)
  })

  it('requires tenant mutation scopes', () => {
    expect(hasPlatformApiPermission(platformManager, 'PUT', '/api/tenants')).toBe(true)
    expect(hasPlatformApiPermission({ ...platformManager, scope: 'tenants:read' }, 'DELETE', '/api/tenants/shop')).toBe(false)
  })
})
