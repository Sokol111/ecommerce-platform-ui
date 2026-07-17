import { consola } from 'consola'

const logger = consola.withTag('api:tenants:update')

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const tenantClient = await useTenantClientUser(event)

  try {
    const result = await tenantClient.updateTenant(body)
    return { success: true, data: result }
  } catch (error: unknown) {
    await rethrowConnectAuthError(event, error)
    const err = error as {
      response?: {
        status?: number
        data?: {
          title?: string
          detail?: string
          fields?: Record<string, string>
        }
      }
    }
    logger.error('Failed to update tenant', error)
    return {
      success: false,
      error: {
        title: err.response?.data?.title || 'Failed to update tenant',
        detail: err.response?.data?.detail,
        fields: err.response?.data?.fields
      }
    }
  }
})
