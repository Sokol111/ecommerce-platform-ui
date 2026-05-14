import type { RegisterTenantRequest } from '@sokol111/ecommerce-tenant-service-api'
import { RegistrationStatusResponseStatus } from '@sokol111/ecommerce-tenant-service-api'
import { consola } from 'consola'
import type { H3Event } from 'h3'

const logger = consola.withTag('api:register')

const POLL_INTERVAL_MS = 2000
const MAX_POLL_ATTEMPTS = 30

interface RegisterBody {
  shopName: string
  slug: string
  email: string
  password: string
  firstName: string
  lastName: string
}

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event)
  const tenantClient = useTenantClient()

  await registerTenant(tenantClient, body)

  return {
    slug: body.slug,
    adminUrl: buildAdminUrl(body.slug)
  }
})

async function readValidatedBody(event: H3Event): Promise<RegisterBody> {
  const body = await readBody<RegisterBody>(event)

  if (!body?.shopName || !body?.slug || !body?.email || !body?.password || !body?.firstName || !body?.lastName) {
    throw createError({
      statusCode: 400,
      message: 'All fields are required'
    })
  }

  return body
}

async function registerTenant(client: ReturnType<typeof useTenantClient>, body: RegisterBody) {
  try {
    const requestBody: RegisterTenantRequest = {
      slug: body.slug,
      name: body.shopName,
      email: body.email,
      password: body.password,
      firstName: body.firstName,
      lastName: body.lastName
    }

    const response = await client.registerTenant(requestBody)

    if (response.status === 201) {
      logger.info(`Tenant registered synchronously: ${body.slug}`)
      return
    }

    if (response.status === 202) {
      logger.info(`Tenant registration accepted, polling: ${body.slug}`)
      await pollRegistrationStatus(client, body.slug)
      return
    }
  } catch (error: unknown) {
    const err = error as { response?: { status?: number } }
    if (err.response?.status === 409) {
      throw createError({
        statusCode: 409,
        message: 'This shop URL is already taken. Please choose another one.'
      })
    }
    logger.error(`Failed to register tenant: ${body.slug}`, error)
    throw createError({
      statusCode: 500,
      message: 'Failed to create shop. Please try again.'
    })
  }
}

async function pollRegistrationStatus(client: ReturnType<typeof useTenantClient>, slug: string) {
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    await sleep(POLL_INTERVAL_MS)

    const status = await client.getRegistrationStatus(slug)

    switch (status.status) {
      case RegistrationStatusResponseStatus.completed:
        logger.info(`Tenant registration completed: ${slug}`)
        return
      case RegistrationStatusResponseStatus.rolled_back:
        throw createError({
          statusCode: 500,
          message: status.failureReason || 'Registration failed. Please try again.'
        })
      case RegistrationStatusResponseStatus.compensating:
        throw createError({
          statusCode: 500,
          message: 'Registration failed. Please try again.'
        })
      case RegistrationStatusResponseStatus.provisioning:
        // Still in progress, continue polling
        break
    }
  }

  throw createError({
    statusCode: 504,
    message: 'Registration is taking too long. Please try again later.'
  })
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function buildAdminUrl(slug: string): string {
  const { baseDomain } = useRuntimeConfig()
  return `http://${slug}.admin${baseDomain}`
}
