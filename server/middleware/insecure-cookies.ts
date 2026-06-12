// Workaround: h3 useSession hardcodes `Secure` on session cookies.
// nuxt-oidc-auth auth session doesn't expose cookie config.
// On HTTP (local dev) browsers reject Secure cookies → state mismatch.
// This middleware strips the Secure flag when NUXT_COOKIE_SECURE=false.

export default defineEventHandler((event) => {
  if (!useRuntimeConfig().cookieSecure) {
    const res = event.node.res
    const originalSetHeader = res.setHeader.bind(res)
    res.setHeader = (name: string, value: string | readonly string[]) => {
      if (name.toLowerCase() === 'set-cookie') {
        const strip = (v: string) => v.replace(/;\s*[Ss]ecure/g, '')
        value = Array.isArray(value) ? value.map(strip) : strip(value as string)
      }
      return originalSetHeader(name, value)
    }
  }
})
