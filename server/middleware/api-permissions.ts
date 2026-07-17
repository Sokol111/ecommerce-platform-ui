export default defineEventHandler(async (event) => {
  if (!event.path.startsWith('/api/tenants')) return

  const token = await useAuthToken(event)
  const claims = await verifyAccessToken(token, event)
  if (!hasPlatformAccess(claims)) {
    throw createError({ statusCode: 403, message: 'Platform admin access required' })
  }
  if (!hasPlatformApiPermission(claims, event.method, event.path)) {
    throw createError({ statusCode: 403, message: 'Insufficient permissions' })
  }
})
