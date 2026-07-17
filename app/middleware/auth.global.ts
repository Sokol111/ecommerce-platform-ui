export default defineNuxtRouteMiddleware(async (to) => {
  if (to.meta.auth === false) {
    return
  }

  const { loggedIn, ready, fetch } = useUserSession()

  if (!ready.value) {
    await fetch()
  }

  if (!loggedIn.value) {
    return navigateTo('/login')
  }
})
