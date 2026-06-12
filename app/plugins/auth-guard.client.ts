/**
 * Watches for 401 errors from API calls when the user is already on a page.
 * The server clears the session cookie on 401, so we just need to
 * reload the page — the server-side auth middleware will redirect to /login.
 */
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:error', (error) => {
    if ((error as { statusCode?: number }).statusCode === 401) {
      reloadNuxtApp({ path: useRoute().fullPath })
    }
  })
})
