import type { RoleResponse } from '~/utils/apiEndpoints'

export function useUserReferenceData() {
  const userStore = useUserStore()
  const { $api } = useNuxtApp()

  async function loadRoles() {
    if (userStore.rolesStatus !== 'idle') {
      return
    }

    userStore.setRolesStatus('loading')

    try {
      const request = apiEndpoints.user.getRoles()
      const roles = await $api<RoleResponse[]>(
        request.path,
        request.options
      )

      userStore.setRoles(roles ?? [])
    } catch (err) {
      userStore.setRolesStatus('error')
      console.error('取得角色資料失敗：', err)
    }
  }

  async function initializeUserReferenceData() {
    await loadRoles()
  }

  return {
    initializeUserReferenceData
  }
}
