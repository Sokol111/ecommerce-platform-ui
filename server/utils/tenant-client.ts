import type { H3Event } from 'h3'

export function useTenantClient(event: H3Event) {
  const { tenantApiUrl: baseURL, platformServiceToken } = useRuntimeConfig()

  const headers: Record<string, string> = {}
  if (platformServiceToken) {
    headers.Authorization = `Bearer ${platformServiceToken}`
  }

  return {
    async createTenant(slug: string, name: string) {
      return $fetch<{ id: string, slug: string, name: string }>('/v1/tenant/create', {
        baseURL,
        method: 'POST',
        headers,
        body: { slug, name }
      })
    }
  }
}
