import { defineStore } from 'pinia'
import type { RoleResponse, UserInfoDto } from '../utils/apiEndpoints'

type RolesStatus = 'idle' | 'loading' | 'loaded' | 'error'

export const useUserStore = defineStore('user', () => {
  // 存放當前使用者詳細資訊 (不啟用 persistedstate 持久化，防範 SSR 水合問題)
  const user = ref<UserInfoDto | null>(null)
  const roleMap = ref<Record<string, string>>({})
  const rolesStatus = ref<RolesStatus>('idle')

  // 判斷是否已登入的計算屬性
  const isLoggedIn = computed(() => !!user.value)

  // 設定使用者資訊
  function setUser(userInfo: UserInfoDto | null) {
    user.value = userInfo
  }

  function setRoles(roles: RoleResponse[]) {
    roleMap.value = roles.reduce<Record<string, string>>((map, role) => {
      if (role.Id) {
        map[role.Id] = role.RoleDesc ?? role.Id
      }

      return map
    }, {})
    rolesStatus.value = 'loaded'
  }

  function setRolesStatus(status: RolesStatus) {
    rolesStatus.value = status
  }

  function getRoleDesc(id: string) {
    return roleMap.value[id] ?? id
  }

  // 清除使用者資訊並一併登出 (移除 Cookie)
  function logOut() {
    user.value = null
    roleMap.value = {}
    rolesStatus.value = 'idle'

    const accessToken = useCookie('access_token')
    const refreshToken = useCookie('refresh_token')

    accessToken.value = null
    refreshToken.value = null
    clearNuxtData()
  }

  return {
    user,
    roleMap,
    rolesStatus,
    isLoggedIn,
    setUser,
    setRoles,
    setRolesStatus,
    getRoleDesc,
    logOut
  }
})
