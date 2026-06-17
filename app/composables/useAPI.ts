export const useAPI = createUseFetch((callerOptions) => {
  const config = useRuntimeConfig()
  const token = useCookie('auth_token')

  return {
    baseURL: config.public.apiBase || '',
    onRequest({ options }) {
      const headers = new Headers(options.headers)
      if (token.value) {
        headers.set('Authorization', `Bearer ${token.value}`)
      }
      options.headers = headers
    },
    ...callerOptions,
  }
})
