import { consola } from 'consola'

const logger = consola.withTag('api:tenants:delete')

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Tenant slug is required' })
  }

  const tenantClient = await useTenantClientUser(event)

  try {
    await tenantClient.deleteTenant(slug)
    return { success: true }
  } catch (error: unknown) {
    await rethrowConnectAuthError(event, error)
    const err = error as {
      response?: {
        status?: number
        data?: {
          title?: string
          detail?: string
        }
      }
    }
    logger.error(`Failed to delete tenant ${slug}`, error)
    return {
      success: false,
      error: {
        title: err.response?.data?.title || 'Failed to delete tenant',
        detail: err.response?.data?.detail
      }
    }
  }
})
