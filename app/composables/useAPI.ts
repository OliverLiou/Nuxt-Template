export const getSharedFetchOptions = () => {
  const config = useRuntimeConfig()

  return {
    baseURL: config.public.apiBase || '',
    onRequest({ options }: { options: any }) {
      // 動態 Token 獲取：每次發送請求時，皆動態抓取 Cookie 中的最新 token
      const token = useCookie('access_token')
      const headers = new Headers(options.headers)
      if (token.value) {
        headers.set('Authorization', `Bearer ${token.value}`)
      }
      options.headers = headers
    },
    onRequestError({ error }: { error: any }) {
      throw createError({
        statusCode: 0,
        message: '後端伺服器未回應'
      })
    },
    onResponseError({ response }: { response: any }) {
      console.error(`[API Response Error] 狀態碼 ${response.status}:`, response._data)
      
      const errorMessage = response._data?.Message || '系統發生未知錯誤'
      
      // 使用 useSystemStore 呼叫全域 BaseModal 對話視窗顯示錯誤
      const systemStore = useSystemStore()
      systemStore.openModal({
        mode: 'alert',
        title: '系統提示',
        description: errorMessage,
        confirmLabel: '確定'
      })

      // 401 認證逾期全域處理
      if (response.status === 401) {
        const userStore = useUserStore()
        userStore.logOut()
        navigateTo('/login')
      }
    }
  }
}

// 用於 Setup 階段的 Composable 版本 (Queries)
export const useAPI = createUseFetch((callerOptions) => ({
  ...getSharedFetchOptions(),
  ...callerOptions
}))

// 用於非 Setup 事件與操作的 Promise 版本 (Actions)
export const $api = <T>(request: string, options?: any): Promise<T> => {
  return $fetch<T>(request, {
    ...getSharedFetchOptions(),
    ...options
  })
}
