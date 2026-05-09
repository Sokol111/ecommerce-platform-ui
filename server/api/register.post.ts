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
    await client.registerTenant({
      slug: body.slug,
      name: body.shopName,
      email: body.email,
      password: body.password,
      firstName: body.firstName,
      lastName: body.lastName
    })
    logger.info(`Tenant registered: ${body.slug}`)
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

function buildAdminUrl(slug: string): string {
  const { baseDomain } = useRuntimeConfig()
  return `http://${slug}.admin${baseDomain}`
}
