import { consola } from 'consola'

const logger = consola.withTag('api:tenants:get')

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({
      statusCode: 400,
      message: 'Tenant slug is required'
    })
  }

  const tenantClient = await useTenantClientUser(event)

  try {
    const result = await tenantClient.getTenantBySlug(slug)
    return result
  } catch (error: unknown) {
    const err = error as {
      response?: { status?: number, data?: { detail?: string } }
    }
    logger.error(`Failed to fetch tenant ${slug}`, error)
    throw createError({
      statusCode: err.response?.status || 500,
      message: err.response?.data?.detail || 'Failed to fetch tenant'
    })
  }
})
