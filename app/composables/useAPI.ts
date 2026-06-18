export const useAPI = createUseFetch((callerOptions) => {
  const config = useRuntimeConfig()
  const token = useCookie('access_token')

  return {
    baseURL: config.public.apiBase || '',
    onRequest({ options }) {
      const headers = new Headers(options.headers)
      if (token.value) {
        headers.set('Authorization', `Bearer ${token.value}`)
      }
      options.headers = headers
    },
    onRequestError({ error }: { error: any }) {
      // 拋出全新錯誤，完全取代原始 FetchError（不再帶有 method + URL）
      throw createError({
        statusCode: 0,
        message: '後端伺服器未回應'
      })
    },
    onResponseError({ response }) {
      console.error(`[API Response Error] 狀態碼 ${response.status}:`, response._data)
    },
    ...callerOptions,
  }
})
