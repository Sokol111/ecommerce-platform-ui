import { createClient } from '@connectrpc/connect'
import { createGrpcTransport } from '@connectrpc/connect-node'
import { TenantService } from '@sokol111/ecommerce-tenant-service-api'

export function useTenantClient() {
  const { tenantApiUrl: baseUrl } = useRuntimeConfig()

  const makeTransport = (token: string) => createGrpcTransport({
    baseUrl,
    interceptors: [
      (next) => (req) => {
        req.header.set('Authorization', `Bearer ${token}`)
        return next(req)
      }
    ]
  })

  return {
    async createTenant(slug: string, name: string) {
      const token = await getS2SToken()
      const client = createClient(TenantService, makeTransport(token))
      const res = await client.createTenant({ slug, name })
      return res.tenant!
    },

    async registerTenant(body: {
      slug: string
      name: string
      email: string
      password: string
      firstName: string
      lastName: string
    }) {
      const token = await getS2SToken()
      const client = createClient(TenantService, makeTransport(token))
      return client.registerTenant(body)
    },

    async getRegistrationStatus(slug: string) {
      const token = await getS2SToken()
      const client = createClient(TenantService, makeTransport(token))
      return client.getRegistrationStatus({ slug })
    }
  }
}
