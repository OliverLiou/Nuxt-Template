// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,
  modules: ['@nuxt/ui', '@nuxt/icon', '@pinia/nuxt'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      apiBase: '', // 可以透過 NUXT_PUBLIC_API_BASE 環境變數覆寫
    }
  },
  vite: {
    optimizeDeps: {
      include: [
        '@vue/devtools-core',
        '@vue/devtools-kit',
        'zod'
      ]
    }
  },
  app: {
    head: {
      title: 'Dashboard-Template'
    }
  }
})
