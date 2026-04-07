import type { H3Event } from 'h3'

export function useAuthClient(_event: H3Event) {
  const { authApiUrl: baseURL, platformServiceToken } = useRuntimeConfig()

  const headers: Record<string, string> = {}
  if (platformServiceToken) {
    headers.Authorization = `Bearer ${platformServiceToken}`
  }

  return {
    async createUser(tenantSlug: string, body: {
      email: string
      password: string
      firstName: string
      lastName: string
      role: string
    }) {
      return $fetch<{ id: string }>('/v1/admin/users/create', {
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
      return $fetch<{
        accessToken: string
        refreshToken: string
        expiresIn: number
        expiresAt: string
        refreshExpiresIn: number
        refreshExpiresAt: string
      }>('/v1/admin/login', {
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
