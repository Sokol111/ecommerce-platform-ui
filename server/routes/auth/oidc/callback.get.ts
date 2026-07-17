export default defineEventHandler((event) => {
  const { apiResourceIndicator } = useRuntimeConfig(event)
  return defineOAuthOidcEventHandler({
    config: {
      scope: ['openid', 'profile', 'email', 'offline_access', 'tenants:read', 'tenants:write', 'tenants:delete'],
      params: {
        authorization_endpoint: { resource: apiResourceIndicator, prompt: 'login consent' },
        token_endpoint: { resource: apiResourceIndicator }
      }
    },
    async onSuccess(event, { tokens }) {
      try {
        if (!tokens.id_token) throw new Error('Missing ID token')
        const [profile, access] = await Promise.all([
          verifyIdToken(tokens.id_token, event),
          verifyAccessToken(tokens.access_token, event)
        ])
        if (!hasPlatformAccess(access)) {
          await clearAuthSession(event)
          return sendRedirect(event, '/login?error=platform_access_required')
        }

        await replaceUserSession(event, {
          user: {
            id: profile.sub,
            email: profile.email ?? '',
            firstName: profile.given_name ?? '',
            lastName: profile.family_name ?? '',
            name: profile.name ?? ''
          },
          secure: {
            accessToken: tokens.access_token,
            accessTokenExpiresAt: access.exp,
            idToken: tokens.id_token,
            refreshToken: tokens.refresh_token
          }
        })
        return sendRedirect(event, '/dashboard')
      } catch (error) {
        console.error('OIDC token validation failed', error)
        await clearAuthSession(event)
        return sendRedirect(event, '/login?error=oidc_auth_failed')
      }
    },
    onError(event, error) {
      console.error('OIDC login failed', error)
      return sendRedirect(event, '/login?error=oidc_auth_failed')
    }
  })(event)
})
