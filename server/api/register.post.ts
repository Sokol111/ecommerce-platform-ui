import { consola } from 'consola'
import type { H3Event } from 'h3'

const logger = consola.withTag('api:register')

const MAX_RETRIES = 5
const RETRY_DELAY_MS = 1000

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
  const authClient = useAuthClient()

  await createTenant(tenantClient, body)
  await createAdminUser(authClient, body)

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

async function createAdminUser(client: ReturnType<typeof useAuthClient>, body: RegisterBody) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await client.createUser(body.slug, {
        email: body.email,
        password: body.password,
        firstName: body.firstName,
        lastName: body.lastName,
        role: 'super_admin'
      })
      logger.info(`Admin user created for tenant: ${body.slug}`)
      return
    } catch (error: unknown) {
      const err = error as { response?: { status?: number } }
      if (err.response?.status === 503 && attempt < MAX_RETRIES) {
        logger.warn(`Auth service not ready for ${body.slug}, retry ${attempt}/${MAX_RETRIES}`)
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS))
        continue
      }
      logger.error(`Failed to create admin user for ${body.slug}`, error)
      throw createError({
        statusCode: 500,
        message: 'Shop created but failed to set up your account. Please contact support.'
      })
    }
  }

  throw createError({
    statusCode: 503,
    message: 'Shop is being set up. Please try signing in shortly.'
  })
}

function buildAdminUrl(slug: string): string {
  const { cookieDomain } = useRuntimeConfig()
  const adminDomain = cookieDomain ? `${slug}.admin${cookieDomain}` : `${slug}.admin.localhost:3001`
  return `http://${adminDomain}`
}
