export interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
}

export function useAuth() {
  const { loggedIn, user: sessionUser } = useUserSession()

  const user = computed<UserProfile | null>(() => {
    if (!loggedIn.value || !sessionUser.value) return null
    const profile = sessionUser.value as Partial<UserProfile> & { name?: string }
    const fullName = profile.name ?? ''
    const [first, ...rest] = fullName.split(' ')
    return {
      id: profile.id ?? '',
      email: profile.email ?? '',
      firstName: profile.firstName ?? first ?? '',
      lastName: profile.lastName ?? rest.join(' ') ?? ''
    }
  })

  const isAuthenticated = loggedIn
  const login = async () => {
    await navigateTo('/auth/oidc/callback', { external: true })
  }

  const logout = async () => {
    const { redirectUrl } = await useNuxtApp().$api<{ redirectUrl: string }>('/api/auth/logout', { method: 'POST' })
    await navigateTo(redirectUrl, { external: true })
  }

  return {
    user,
    isAuthenticated,
    login,
    logout
  }
}
