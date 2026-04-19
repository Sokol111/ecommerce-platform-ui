// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({

  modules: ['@nuxt/eslint', '@nuxt/ui', '@pinia/nuxt', '@vueuse/nuxt'],

  devtools: {
    enabled: import.meta.dev
  },
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' }
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    // Server-only (not exposed to client)
    // Values are set from .env: NUXT_TENANT_API_URL, NUXT_ZITADEL_URL, etc.
    tenantApiUrl: '',
    zitadelUrl: '',
    zitadelClientId: '',
    zitadelClientSecret: '',
    zitadelProjectId: '',
    zitadelOrgId: '',

    // Cookie settings (override with NUXT_COOKIE_SECURE=false for local dev)
    cookieSecure: true,

    // Base domain for building tenant URLs (e.g. ".sokolshop.com")
    baseDomain: ''
  },

  routeRules: {
    '/register': { ssr: true }
  },

  experimental: {
    typedPages: true
  },

  compatibilityDate: '2025-01-15',

  vite: {
    server: {
      allowedHosts: true
    }
  },

  hooks: {
    'pages:extend': function (pages) {
      interface NuxtPage { path: string, name?: string, children?: NuxtPage[] }
      function removePagesWithComponents(pages: NuxtPage[]) {
        for (let i = pages.length - 1; i >= 0; i--) {
          const page = pages[i]!
          if (page.path.includes('_components') || page.name?.includes('_components')) {
            pages.splice(i, 1)
          } else if (page.children) {
            removePagesWithComponents(page.children)
          }
        }
      }
      removePagesWithComponents(pages as NuxtPage[])
    }
  },

  eslint: {
    config: {
      stylistic: {
        quotes: 'single',
        semi: false,
        commaDangle: 'never',
        braceStyle: '1tbs',
        arrowParens: true
      }
    }
  },

  fonts: {
    provider: 'local'
  },

  icon: {
    serverBundle: 'local'
  }
})
