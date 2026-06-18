import { RegistrationStatus } from '@sokol111/ecommerce-tenant-service-api'
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
  const requestBody = {
    slug: body.slug,
    name: body.shopName,
    email: body.email,
    password: body.password,
    firstName: body.firstName,
    lastName: body.lastName
  }

  let needsPoll = false

  try {
    const response = await client.registerTenant(requestBody)

    // gRPC response: oneof result { Tenant tenant = 1; RegistrationStatusResponse status = 2; }
    if (response.result.case === 'tenant') {
      logger.info(`Tenant registered synchronously: ${body.slug}`)
      return
    }

    if (response.result.case === 'status') {
      logger.info(`Tenant registration accepted, polling: ${body.slug}`)
      needsPoll = true
    }
  } catch (error: unknown) {
    const err = error as { code?: string | number }
    // ConnectRPC maps gRPC AlreadyExists (6) to code 'already_exists'
    if (err.code === 'already_exists' || err.code === 6) {
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

  if (needsPoll) {
    await pollRegistrationStatus(client, body.slug)
  }
}

async function pollRegistrationStatus(client: ReturnType<typeof useTenantClient>, slug: string) {
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    await sleep(POLL_INTERVAL_MS)

    let status: Awaited<ReturnType<typeof client.getRegistrationStatus>>
    try {
      status = await client.getRegistrationStatus(slug)
    } catch (error: unknown) {
      logger.error(`Failed to poll registration status for: ${slug}`, error)
      throw createError({
        statusCode: 500,
        message: 'Failed to check registration status. Please try again.'
      })
    }

    switch (status.status) {
      case RegistrationStatus.COMPLETED:
        logger.info(`Tenant registration completed: ${slug}`)
        return
      case RegistrationStatus.ROLLED_BACK:
        logger.error(`Tenant registration rolled back: ${slug}, reason: ${status.failureReason}`)
        throw createError({
          statusCode: 500,
          message: status.failureReason || 'Registration failed. Please try again.'
        })
      case RegistrationStatus.COMPENSATING:
        logger.error(`Tenant registration compensating: ${slug}`)
        throw createError({
          statusCode: 500,
          message: 'Registration failed. Please try again.'
        })
      case RegistrationStatus.PROVISIONING:
        // Still in progress, continue polling
        break
    }
  }

  logger.error(`Tenant registration timed out after ${MAX_POLL_ATTEMPTS} attempts: ${slug}`)
  throw createError({
    statusCode: 504,
    message: 'Registration is taking too long. Please try again later.'
  })
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function buildAdminUrl(_slug: string): string {
  const { baseDomain } = useRuntimeConfig()
  return `http://admin${baseDomain}`
}
