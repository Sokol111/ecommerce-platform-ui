import type {
  CreateTenantRequest,
  RegisterTenantRequest,
  RegistrationStatusResponse,
  TenantResponse
} from '@sokol111/ecommerce-tenant-service-api'
import { getCreateTenantUrl, getGetRegistrationStatusUrl, getRegisterTenantUrl } from '@sokol111/ecommerce-tenant-service-api'

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
    },

    async registerTenant(body: RegisterTenantRequest) {
      const token = await getS2SToken()

      return $fetch.raw(getRegisterTenantUrl(), {
        baseURL,
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body
      })
    },

    async getRegistrationStatus(slug: string) {
      const token = await getS2SToken()

      return $fetch<RegistrationStatusResponse>(getGetRegistrationStatusUrl(slug), {
        baseURL,
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
      })
    }
  }
}
