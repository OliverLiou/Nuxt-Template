export const useAPI = createUseFetch((callerOptions) => ({
  ...callerOptions,
  $fetch: useNuxtApp().$api as typeof $fetch
}))
