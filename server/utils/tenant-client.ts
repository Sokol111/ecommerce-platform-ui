import type { CreateTenantRequest, TenantResponse } from '@sokol111/ecommerce-tenant-service-api'
import { getCreateTenantUrl } from '@sokol111/ecommerce-tenant-service-api'

export function useTenantClient() {
  const { tenantApiUrl: baseURL, platformServiceToken } = useRuntimeConfig()

  const headers: Record<string, string> = {}
  if (platformServiceToken) {
    headers.Authorization = `Bearer ${platformServiceToken}`
  }

  return {
    async createTenant(slug: string, name: string) {
      return $fetch<TenantResponse>(getCreateTenantUrl(), {
        baseURL,
        method: 'POST',
        headers,
        body: { slug, name } satisfies CreateTenantRequest
      })
    }
  }
}
