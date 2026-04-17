import type { CreateTenantRequest, TenantResponse } from '@sokol111/ecommerce-tenant-service-api'
import { getCreateTenantUrl } from '@sokol111/ecommerce-tenant-service-api'

export function useTenantClient() {
  const { tenantApiUrl: baseURL } = useRuntimeConfig()

  return {
    async createTenant(slug: string, name: string) {
      const token = await getS2SToken()

      return $fetch<TenantResponse>(getCreateTenantUrl(), {
        baseURL,
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: { slug, name } satisfies CreateTenantRequest
      })
    }
  }
}
