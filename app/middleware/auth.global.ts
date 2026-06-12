export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path.startsWith('/api/')) {
    return
  }

  if (to.meta.auth === false) {
    return
  }

  const { loggedIn } = useOidcAuth()

  if (!loggedIn.value) {
    return navigateTo('/login')
  }
})
