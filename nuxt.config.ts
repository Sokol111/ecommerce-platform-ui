// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({

  modules: ['@nuxt/eslint', '@nuxt/ui', '@pinia/nuxt', '@vueuse/nuxt', 'nuxt-oidc-auth'],

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
    // Values are set from .env: NUXT_TENANT_API_URL, NUXT_LOGTO_URL, etc.
    tenantApiUrl: '',
    logtoUrl: '',
    logtoClientId: '',
    logtoClientSecret: '',
    apiResourceIndicator: '',

    // Cookie settings (override with NUXT_COOKIE_SECURE=false for local dev)
    cookieSecure: true,
    cookieSameSite: 'lax',

    // Base domain for building tenant URLs (e.g. ".sokolshop.com")
    baseDomain: ''
  },

  routeRules: {
    '/register': { ssr: true },
    '/login': { ssr: true }
  },

  experimental: {
    typedPages: true
  },

  compatibilityDate: '2025-01-15',

  vite: {
    optimizeDeps: {
      include: [
        'vue',
        'vue-router',
        '@vueuse/core',
        'zod',
        'reka-ui'
      ]
    },
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
  },

  /**
   * OIDC (nuxt-oidc-auth) — Logto
   *
   * Most values are injected at runtime from env vars (see local/production Helm values)
   */
  oidc: {
    providers: {
      oidc: {
        clientId: '',
        clientSecret: 'pkce-unused',
        redirectUri: '',
        logoutRedirectUri: '',
        authorizationUrl: '',
        tokenUrl: '',
        userinfoUrl: '',
        logoutUrl: '',
        authenticationScheme: 'body',
        pkce: true,
        state: true,
        nonce: false,
        callbackRedirectUrl: '/dashboard',
        scope: [
          'openid', 'profile', 'email',
          'tenants:read', 'tenants:write', 'tenants:delete'
        ],
        responseMode: 'query',
        tokenRequestType: 'form-urlencoded',
        additionalAuthParameters: {
          resource: 'https://api.sokolshop.com'
        },
        additionalTokenParameters: {
          resource: 'https://api.sokolshop.com'
        },
        exposeAccessToken: true,
        validateAccessToken: false,
        validateIdToken: false,
        logoutRedirectParameterName: 'post_logout_redirect_uri',
        additionalLogoutParameters: {
          idTokenHint: ''
        }
      }
    },
    session: {
      expirationCheck: true,
      expirationThreshold: 30,
      automaticRefresh: false,
      cookie: {
        secure: false,
        sameSite: 'lax'
      }
    },
    middleware: {
      globalMiddlewareEnabled: false,
      customLoginPage: true
    }
  }
})
