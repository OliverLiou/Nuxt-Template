export default defineNuxtPlugin(() => {
  // 為 $fetch 添加攔截器
  $fetch.create({
    onRequest({ request, options }) {
      // 自動添加 JWT token 到請求標頭
      if (import.meta.client) {
        const token = localStorage.getItem('auth_token')
        if (token) {
          options.headers = {
            ...options.headers,
            Authorization: `Bearer ${token}`
          } as any
        }
      }
    },

    onResponseError({ response }) {
      // 若 token 過期或無效，自動登出
      if (response.status === 401) {
        if (import.meta.client) {
          localStorage.removeItem('auth_token')
          localStorage.removeItem('auth_user')
          // 重新載入頁面，讓用戶從 Header 重新登入
          window.location.reload()
        }
      }
    }
  })
})