import type { FetchResponse, ResolvedFetchOptions } from 'ofetch'
import type { AuthResponse } from '~/utils/apiEndpoints'

const TERMINAL_REFRESH_STATUS_CODES = new Set([400, 401, 403])

function createResponseError(response: FetchResponse<unknown>) {
  return new ApiError({
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

function enableAuthRetry(options: ResolvedFetchOptions) {
  options.authRetryAttempted = true
  options.retry = 1
  options.retryStatusCodes = [
    ...new Set([...(options.retryStatusCodes ?? []), 401])
  ]
}

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const userStore = useUserStore()
  const systemStore = useSystemStore()
  let refreshPromise: Promise<void> | null = null
  let sessionExpired = false

  async function expireSession() {
    if (sessionExpired) {
      return
    }

    sessionExpired = true
    userStore.logOut()
    void systemStore.openModal({
      title: '系統提示',
      description: '憑證已失效，請重新登入系統。',
      preventClose: true
    })
    await nuxtApp.runWithContext(() => navigateTo('/login'))
  }

  async function refreshAccessToken() {
    if (refreshPromise) {
      return refreshPromise
    }

    refreshPromise = (async () => {
      const accessToken = useCookie<string | null>('access_token')
      const refreshToken = useCookie<string | null>('refresh_token')
      const currentAccessToken = accessToken.value
      const currentRefreshToken = refreshToken.value

      if (!currentAccessToken || !currentRefreshToken) {
        await expireSession()
        throw new ApiError({
          statusCode: 401,
          message: '登入憑證已失效'
        })
      }

      try {
        const request = apiEndpoints.auth.refreshToken({
          AccessToken: currentAccessToken,
          RefreshToken: currentRefreshToken
        })
        const data = await api<AuthResponse>(request.path, request.options)

        if (!data?.AccessToken) {
          throw new ApiError({
            statusCode: 401,
            message: 'Refresh Token API 未回傳有效的 Access Token',
            data
          })
        }

        accessToken.value = data.AccessToken
        if (data.RefreshToken) {
          refreshToken.value = data.RefreshToken
        }
      } catch (error) {
        const normalizedError = normalizeApiError(
          error,
          '更新登入憑證失敗，請稍後再試。'
        )

        if (TERMINAL_REFRESH_STATUS_CODES.has(normalizedError.statusCode)) {
          await expireSession()
          throw new ApiError({
            statusCode: 401,
            message: '登入憑證已失效',
            data: normalizedError.data,
            cause: normalizedError
          })
        }

        throw normalizedError
      } finally {
        refreshPromise = null
      }
    })()

    return refreshPromise
  }

  const api = $fetch.create({
    baseURL: config.public.apiBase || '',

    onRequest({ options }) {
      const authMode = options.authMode ?? 'protected'
      const currentAccessToken = useCookie<string | null>('access_token').value
      const headers = new Headers(options.headers)

      if (authMode === 'protected' && currentAccessToken) {
        if (sessionExpired) {
          sessionExpired = false
        }

        options.authRequestToken = currentAccessToken
        headers.set('Authorization', `Bearer ${currentAccessToken}`)
      } else {
        options.authRequestToken = undefined
        headers.delete('Authorization')
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

    async onResponseError({ options, response }) {
      console.error(
        `[API Response Error] 狀態碼 ${response.status}:`,
        response._data
      )

      const responseError = createResponseError(response)
      const authMode = options.authMode ?? 'protected'
      const currentAccessToken = useCookie<string | null>('access_token').value

      if (
        response.status !== 401
        || authMode === 'public'
        || authMode === 'refresh'
      ) {
        throw responseError
      }

      if (options.authRetryAttempted) {
        await expireSession()
        throw responseError
      }

      if (
        options.authRequestToken
        && currentAccessToken
        && options.authRequestToken !== currentAccessToken
      ) {
        enableAuthRetry(options)
        return
      }

      await refreshAccessToken()
      enableAuthRetry(options)
    }
  })

  return {
    provide: {
      api
    }
  }
})
