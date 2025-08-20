// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  ssr: false,
  devtools: { enabled: true },
  modules: ["@nuxtjs/i18n", "@pinia/nuxt", "@nuxt/icon", "@nuxt/ui"],
  css: ["~/assets/css/main.css"],
  vite: {
    plugins: [tailwindcss()],
  },
  ui: {
    theme: {
      defaultVariants: {
        size: "lg",
      }
    }
  },
  i18n: {
    defaultLocale: "en",
    detectBrowserLanguage: false,
    locales: [
      { code: "en", name: "English", file: "en.json" },
      { code: "zh-tw", name: "繁體中文", file: "zh-tw.json" },
    ],
  },
  pinia: {
    storesDirs: ["./stores/**"],
  },
});