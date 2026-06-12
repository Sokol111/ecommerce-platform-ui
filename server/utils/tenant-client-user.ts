import type {
    GetTenantListParams,
    TenantListResponse,
    TenantResponse,
    TenantSlugListResponse,
    UpdateTenantRequest
} from '@sokol111/ecommerce-tenant-service-api'
import {
    getDeleteTenantUrl,
    getGetEnabledTenantSlugsUrl,
    getGetTenantBySlugUrl,
    getGetTenantListUrl,
    getUpdateTenantUrl
} from '@sokol111/ecommerce-tenant-service-api'
import type { H3Event } from 'h3'

export async function useTenantClientUser(event: H3Event) {
  const { tenantApiUrl: baseURL } = useRuntimeConfig()
  const token = await useAuthToken(event)
  const headers: HeadersInit = { Authorization: `Bearer ${token}` }

  return {
    async getTenantList(
      params?: Partial<GetTenantListParams>
    ): Promise<TenantListResponse> {
      return $fetch<TenantListResponse>(getGetTenantListUrl({
        page: params?.page ?? 1,
        size: params?.size ?? 10,
        sort: params?.sort,
        order: params?.order,
        enabled: params?.enabled
      }), {
        baseURL,
        headers
      })
    },

    async getTenantBySlug(slug: string): Promise<TenantResponse> {
      return $fetch<TenantResponse>(getGetTenantBySlugUrl(slug), {
        baseURL,
        headers
      })
    },

    async getEnabledTenantSlugs(): Promise<TenantSlugListResponse> {
      return $fetch<TenantSlugListResponse>(getGetEnabledTenantSlugsUrl(), {
        baseURL,
        headers
      })
    },

    async updateTenant(body: UpdateTenantRequest): Promise<TenantResponse> {
      return $fetch<TenantResponse>(getUpdateTenantUrl(), {
        baseURL,
        method: 'PUT',
        headers,
        body
      })
    },

    async deleteTenant(slug: string): Promise<void> {
      await $fetch(getDeleteTenantUrl(slug), {
        baseURL,
        method: 'DELETE',
        headers
      })
    }
  }
}

export type TenantClientUser = ReturnType<typeof useTenantClientUser>
