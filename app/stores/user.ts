import { defineStore } from 'pinia'
import type { UserInfoDto } from '../utils/apiEndpoints'

export const useUserStore = defineStore('user', () => {
  // 存放當前使用者詳細資訊 (不啟用 persistedstate 持久化，防範 SSR 水合問題)
  const user = ref<UserInfoDto | null>(null)

  // 判斷是否已登入的計算屬性
  const isLoggedIn = computed(() => !!user.value)

  // 設定使用者資訊
  function setUser(userInfo: UserInfoDto | null) {
    user.value = userInfo
  }

  // 清除使用者資訊並一併登出 (移除 Cookie)
  function logOut() {
    user.value = null
    
    const accessToken = useCookie('access_token')
    const refreshToken = useCookie('refresh_token')
    
    accessToken.value = null
    refreshToken.value = null
    clearNuxtData();
  }

  return {
    user,
    isLoggedIn,
    setUser,
    logOut
  }
})
