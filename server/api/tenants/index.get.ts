import type { GetTenantListSort } from '@sokol111/ecommerce-tenant-service-api'
import { consola } from 'consola'

const logger = consola.withTag('api:tenants:list')

export default defineEventHandler(async (event) => {
  const tenantClient = await useTenantClientUser(event)
  const query = getQuery(event)

  try {
    const result = await tenantClient.getTenantList({
      page: query.page ? Number(query.page) : undefined,
      size: query.size ? Number(query.size) : undefined,
      sort: query.sort as GetTenantListSort | undefined,
      order: query.order as 'asc' | 'desc' | undefined,
      enabled:
        query.enabled === 'true'
          ? true
          : query.enabled === 'false'
            ? false
            : undefined
    })

    return result
  } catch (error: unknown) {
    const err = error as {
      response?: { status?: number, data?: { detail?: string } }
    }
    logger.error('Failed to fetch tenants', error)
    throw createError({
      statusCode: err.response?.status || 500,
      message: err.response?.data?.detail || 'Failed to fetch tenants'
    })
  }
})
