// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  ssr: true,
  devtools: { enabled: true },
  app: {
    head: {
      title: "Nuxt-Template",
    },
  },
  modules: ["@nuxtjs/i18n", "@pinia/nuxt", "@nuxt/icon", "@nuxt/ui"],
  css: ["~/assets/css/main.css"],
  vite: {
    plugins: [tailwindcss()],
  },
  ui: {
    theme: {
      defaultVariants: {
        size: "lg",
      },
    },
  },
  i18n: {
    defaultLocale: "en",
    detectBrowserLanguage: false,
    strategy: "no_prefix",
    locales: [
      { code: "en", name: "English", file: "en.json" },
      { code: "zh_TW", name: "繁體中文", file: "zh_TW.json" },
    ],
  },
  runtimeConfig: {
    public: {
      googleClientId: process.env.GOOGLE_CLIENT_ID,
      apiBaseUrl: process.env.API_BASE_URL || "http://localhost:5001",
    },
  },
  nitro: {
    routeRules: {
      "/**": {
        headers: {
          "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
        },
      },
    },
  },
});