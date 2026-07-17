export default defineNuxtPlugin(() => {
  let redirecting = false
  const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined
  const api = $fetch.create({
    headers,
    onResponseError({ response }) {
      if (import.meta.client && response.status === 401 && !redirecting) {
        redirecting = true
        void reloadNuxtApp({ path: '/login' })
      }
    }
  })

  return { provide: { api } }
})
