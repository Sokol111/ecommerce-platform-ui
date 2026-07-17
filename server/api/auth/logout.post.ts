export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const { clientId, clientSecret } = config.oauth.oidc
  const tokens = await getAuthSessionTokens(event)
  invalidateAuthRefresh(tokens?.refreshToken)
  await clearAuthSession(event)

  if (tokens?.refreshToken && config.oidcRevocationUrl && clientId && clientSecret) {
    try {
      await $fetch(config.oidcRevocationUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          token: tokens.refreshToken,
          token_type_hint: 'refresh_token'
        }).toString()
      })
    } catch (error) {
      console.error('OIDC refresh token revocation failed', error)
    }
  }

  if (!config.oidcLogoutUrl) return { redirectUrl: config.oidcLogoutRedirectUrl || '/' }
  const logoutUrl = new URL(config.oidcLogoutUrl)
  logoutUrl.searchParams.set('post_logout_redirect_uri', config.oidcLogoutRedirectUrl)
  if (tokens?.idToken) logoutUrl.searchParams.set('id_token_hint', tokens.idToken)
  return { redirectUrl: logoutUrl.toString() }
})
