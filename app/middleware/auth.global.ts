import type { UserInfoDto } from '~/utils/apiEndpoints'

export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === '/login') {
    return
  }

  const accessToken = useCookie<string | null>('access_token')
  if (!accessToken.value) {
    return navigateTo('/login')
  }

  const userStore = useUserStore()
  if (userStore.user) {
    return
  }

  try {
    const { $api } = useNuxtApp()
    const request = apiEndpoints.user.getUserProfile()
    const data = await $api<UserInfoDto>(request.path, request.options)

    if (!data) {
      throw new ApiError({
        statusCode: 0,
        message: '取得使用者資料失敗：API 未回傳資料'
      })
    }

    userStore.setUser(data)
  } catch (error) {
    const normalizedError = normalizeApiError(
      error,
      '取得使用者資料失敗，請稍後再試。'
    )

    if (normalizedError.statusCode === 401) {
      return navigateTo('/login')
    }

    throw normalizedError
  }
})
