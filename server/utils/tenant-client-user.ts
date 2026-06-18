import { createClient } from '@connectrpc/connect'
import { createGrpcTransport } from '@connectrpc/connect-node'
import type {
  GetEnabledTenantSlugsResponse,
  Tenant,
  UpdateTenantRequest
} from '@sokol111/ecommerce-tenant-service-api'
import { TenantService } from '@sokol111/ecommerce-tenant-service-api'
import type { H3Event } from 'h3'

export async function useTenantClientUser(event: H3Event) {
  const { tenantApiUrl: baseUrl } = useRuntimeConfig()
  const token = await useAuthToken(event)

  const transport = createGrpcTransport({
    baseUrl,
    interceptors: [
      (next) => (req) => {
        req.header.set('Authorization', `Bearer ${token}`)
        return next(req)
      }
    ]
  })

  const client = createClient(TenantService, transport)

  return {
    async getTenantList(params?: {
      page?: number
      size?: number
      sort?: string
      order?: string
      enabled?: boolean
    }) {
      const res = await client.getTenantList({
        page: params?.page ?? 1,
        size: params?.size ?? 10,
        sort: params?.sort,
        order: params?.order,
        enabled: params?.enabled
      })
      return res
    },

    async getTenantBySlug(slug: string): Promise<Tenant> {
      const res = await client.getTenantBySlug({ slug })
      return res.tenant!
    },

    async getEnabledTenantSlugs(): Promise<GetEnabledTenantSlugsResponse> {
      return client.getEnabledTenantSlugs({})
    },

    async updateTenant(req: UpdateTenantRequest): Promise<Tenant> {
      const res = await client.updateTenant(req)
      return res.tenant!
    },

    async deleteTenant(slug: string): Promise<void> {
      await client.deleteTenant({ slug })
    }
  }
}

export type TenantClientUser = Awaited<ReturnType<typeof useTenantClientUser>>
