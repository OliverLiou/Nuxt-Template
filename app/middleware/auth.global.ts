import type { AuthResponse, UserInfoDto } from '~/utils/apiEndpoints'

export default defineNuxtRouteMiddleware(async (to) => {
  const userStore = useUserStore()
  const systemStore = useSystemStore()
  const { $api } = useNuxtApp()

  // 1. 當路由進入 /login 時，最優先在伺服器端或客戶端清除 Cookie 與重置 Store
  if (to.path === '/login') {
    // userStore.logOut()
    return
  }

  const accessToken = useCookie('access_token')
  const refreshToken = useCookie('refresh_token')

  // 2. 若 access_token 不存在，直接導回登入頁，且不顯示任何過期提示訊息
  if (!accessToken.value) {
    return navigateTo('/login')
  }

  // 3. 判斷 token 是否過期並進行自動換發
  if (isTokenExpired(accessToken.value)) {
    if (refreshToken.value) {
      try {
        // 向後端換發 Token
        const request = apiEndpoints.auth.refreshToken({
          AccessToken: accessToken.value,
          RefreshToken: refreshToken.value
        })
        const data = await $api<AuthResponse>(request.path, request.options)

        if (!data || !data.AccessToken) {
          throw new Error('Refresh token API failed or returned empty token')
        }

        // 換發成功，寫入新的 Token Cookie
        accessToken.value = data.AccessToken
        if (data.RefreshToken) {
          refreshToken.value = data.RefreshToken
        }
      } catch (err) {
        console.error('自動換發 Token 失敗：', err)
        userStore.logOut() // 清除 Token 與狀態
        systemStore.openModal({
          title: '系統提示',
          description: '您的登入已逾期，請重新登入。',
          preventClose: true
        })
        return navigateTo('/login')
      }
    } else {
      // Token 已過期且無 refresh_token，直接登出並顯示逾期 Modal
      userStore.logOut()
      systemStore.openModal({
        title: '系統提示',
        description: '您的登入已逾期，請重新登入。',
        preventClose: true
      })
      return navigateTo('/login')
    }
  }

  // 4. 驗證通過（Token 未過期或已成功 Refresh）
  // 若 Store 中尚無使用者資訊，則自動向後端拉取並儲存
  if (!userStore.user) {
    try {
      const request = apiEndpoints.user.getUserProfile()
      const data = await $api<UserInfoDto>(request.path, request.options)
      
      if (!data) {
        throw new Error('Fetch user profile API failed or returned empty data')
      }

      // 儲存至 Pinia Store
      userStore.setUser(data)
    } catch (err) {
      console.error('取得使用者資料失敗，將強制登出並轉至登入頁：', err)
      userStore.logOut()
      systemStore.openModal({
        title: '系統提示',
        description: '您的登入已逾期，請重新登入。',
        preventClose: true
      })
      return navigateTo('/login')
    }
  }

})
