const safeMethods = new Set(['GET', 'HEAD', 'OPTIONS'])

export default defineEventHandler((event) => {
  if (!event.path.startsWith('/api/') || safeMethods.has(event.method)) return

  const origin = getHeader(event, 'origin')
  if (origin !== getRequestURL(event).origin) {
    throw createError({ statusCode: 403, message: 'Cross-origin request is not allowed' })
  }
})
