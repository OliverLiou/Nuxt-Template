export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const api = $fetch.create({
    baseURL: config.public.apiBase || '',

    onRequest({ options }) {
      const token = useCookie<string | null>('access_token')
      const headers = new Headers(options.headers)

      if (token.value) {
        headers.set('Authorization', `Bearer ${token.value}`)
      }

      options.headers = headers
    },

    onRequestError({ error }) {
      throw new ApiError({
        statusCode: 0,
        message: '後端伺服器未回應',
        cause: error
      })
    },

    onResponseError({ response }) {
      console.error(
        `[API Response Error] 狀態碼 ${response.status}:`,
        response._data
      )

      throw new ApiError({
        statusCode: response.status,
        message: getApiErrorMessage(
          {
            statusCode: response.status,
            data: response._data
          },
          response.statusText || '系統發生未知錯誤'
        ),
        data: response._data,
        cause: response
      })
    }
  })

  return {
    provide: {
      api
    }
  }
})
