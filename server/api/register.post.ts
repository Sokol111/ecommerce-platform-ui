import { consola } from 'consola'
import type { H3Event } from 'h3'

const logger = consola.withTag('api:register')

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
  const zitadel = useZitadelClient()

  await createTenant(tenantClient, body)
  await createAdminUser(zitadel, body)

  return {
    slug: body.slug,
    adminUrl: buildAdminUrl()
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

async function createTenant(client: ReturnType<typeof useTenantClient>, body: RegisterBody) {
  try {
    await client.createTenant(body.slug, body.shopName)
    logger.info(`Tenant created: ${body.slug}`)
  } catch (error: unknown) {
    const err = error as { response?: { status?: number } }
    if (err.response?.status === 409) {
      throw createError({
        statusCode: 409,
        message: 'This shop URL is already taken. Please choose another one.'
      })
    }
    logger.error(`Failed to create tenant: ${body.slug}`, error)
    throw createError({
      statusCode: 500,
      message: 'Failed to create shop. Please try again.'
    })
  }
}

async function createAdminUser(zitadel: ReturnType<typeof useZitadelClient>, body: RegisterBody) {
  try {
    const userId = await zitadel.createUser({
      email: body.email,
      password: body.password,
      firstName: body.firstName,
      lastName: body.lastName,
      tenantSlug: body.slug
    })
    logger.info(`User created in Zitadel: ${userId}`)

    await zitadel.grantRole(userId, 'super_admin')
    logger.info(`Granted super_admin role for tenant: ${body.slug}`)
  } catch (error: unknown) {
    logger.error(`Failed to create admin user for ${body.slug}`, error)
    throw createError({
      statusCode: 500,
      message: 'Shop created but failed to set up your account. Please contact support.'
    })
  }
}

function buildAdminUrl(): string {
  const { baseDomain } = useRuntimeConfig()
  return `http://admin${baseDomain}`
}
