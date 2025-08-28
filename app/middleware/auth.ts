export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()
  
  // 如果用戶未登入，阻止訪問受保護的頁面
  if (!authStore.isLoggedIn) {
    // 不重定向，用戶可以從 Header 登入
    throw createError({
      statusCode: 401,
      statusMessage: '請先登入以存取此頁面'
    })
  }
})