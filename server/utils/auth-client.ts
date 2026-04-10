import type { AdminAuthResponse, AdminUserCreateRequest, AdminUserResponse } from '@sokol111/ecommerce-auth-service-api'
import { getAdminLoginUrl, getAdminUserCreateUrl } from '@sokol111/ecommerce-auth-service-api'

export function useAuthClient() {
  const { authApiUrl: baseURL, platformServiceToken } = useRuntimeConfig()

  const headers: Record<string, string> = {}
  if (platformServiceToken) {
    headers.Authorization = `Bearer ${platformServiceToken}`
  }

  return {
    async createUser(tenantSlug: string, body: AdminUserCreateRequest) {
      return $fetch<AdminUserResponse>(getAdminUserCreateUrl(), {
        baseURL,
        method: 'POST',
        headers: {
          ...headers,
          'X-Tenant-Slug': tenantSlug
        },
        body
      })
    },

    async login(tenantSlug: string, email: string, password: string) {
      return $fetch<AdminAuthResponse>(getAdminLoginUrl(), {
        baseURL,
        method: 'POST',
        headers: {
          'X-Tenant-Slug': tenantSlug
        },
        body: { email, password }
      })
    }
  }
}
