import { defineStore } from 'pinia'
import type { RoleResponse, UserInfoDto } from '../utils/apiEndpoints'

export const useUserStore = defineStore('user', () => {
  // 存放當前使用者詳細資訊 (不啟用 persistedstate 持久化，防範 SSR 水合問題)
  const user = ref<UserInfoDto | null>(null)
  const roles = ref<RoleResponse[]>([])
  let rolesRequest: Promise<void> | null = null
  let rolesLoadVersion = 0

  // 判斷是否已登入的計算屬性
  const isLoggedIn = computed(() => !!user.value)

  // 設定使用者資訊
  function setUser(userInfo: UserInfoDto | null) {
    user.value = userInfo
  }

  function loadRoles(): Promise<void> {
    if (rolesRequest) {
      return rolesRequest
    }

    const loadVersion = ++rolesLoadVersion
    roles.value = []

    rolesRequest = (async () => {
      try {
        const { $api } = useNuxtApp()
        const request = apiEndpoints.user.getRoles()
        const result = await $api<RoleResponse[]>(
          request.path,
          request.options
        )

        if (loadVersion === rolesLoadVersion) {
          roles.value = result
        }
      } catch (error) {
        if (loadVersion === rolesLoadVersion) {
          roles.value = []
        }

        throw error
      } finally {
        if (loadVersion === rolesLoadVersion) {
          rolesRequest = null
        }
      }
    })()

    return rolesRequest
  }

  // 清除使用者資訊並一併登出 (移除 Cookie)
  function logOut() {
    user.value = null
    roles.value = []
    rolesRequest = null
    rolesLoadVersion++

    const accessToken = useCookie('access_token')
    const refreshToken = useCookie('refresh_token')

    accessToken.value = null
    refreshToken.value = null
    clearNuxtData()
  }

  return {
    user,
    roles,
    isLoggedIn,
    setUser,
    loadRoles,
    logOut
  }
})
