import { defineStore } from 'pinia'

interface User {
  id: string
  userName: string
  email: string
  picture?: string
}

interface AuthResponse {
  success: boolean
  message: string
  token?: string
  vUserInfo?: User
}

interface TokenVerifyResponse {
  isValid: boolean
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  let tokenExpiryInterval: NodeJS.Timeout | null = null
  
  const isLoggedIn = computed(() => !!token.value)
  const isAutoLogout = ref<boolean>(false)
  const toast = useToast();

  // 解析 JWT payload
  const parseJwtPayload = (token: string) => {
    try {
      const base64Url = token.split('.')[1]
      if (!base64Url) return null
      
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      
      return JSON.parse(jsonPayload)
    } catch (error) {
      console.error('Failed to parse JWT token:', error)
      return null
    }
  }

  // 檢查 token 是否已過期
  const isTokenExpired = (token: string): boolean => {
    const payload = parseJwtPayload(token)
    if (!payload || !payload.exp) return true
    
    const currentTime = Math.floor(Date.now() / 1000)
    return payload.exp < currentTime
  }

  // 檢查並處理過期的 token
  const checkTokenExpiry = () => {
    if (!token.value) return
    
    if (isTokenExpired(token.value)) {
      console.log('Token has expired, logging out automatically')
      // 標記為自動登出
      isAutoLogout.value = true
      logout() 

    }
  }

  // 清除定期檢查
  const clearTokenExpiryCheck = () => {
    if (tokenExpiryInterval) {
      clearInterval(tokenExpiryInterval)
      tokenExpiryInterval = null
    }
  }

  // 開始定期檢查 token 過期
  const startTokenExpiryCheck = () => {
    clearTokenExpiryCheck()
    // 每 5 分鐘檢查一次 token 是否過期
    tokenExpiryInterval = setInterval(() => {
      checkTokenExpiry()
    }, 5 * 60 * 1000)
  }

  // 初始化認證狀態
  const initAuth = () => {
    if (import.meta.client) {
      const savedToken = localStorage.getItem('auth_token')
      const savedUser = localStorage.getItem('auth_user')
      
      if (savedToken && savedUser) {
        // 檢查 token 是否已過期
        if (isTokenExpired(savedToken)) {
          console.log('Stored token has expired, clearing auth data')
          localStorage.removeItem('auth_token')
          localStorage.removeItem('auth_user')
          return
        }
        
        token.value = savedToken
        user.value = JSON.parse(savedUser)
        
        // 開始定期檢查 token 過期
        startTokenExpiryCheck()
      }
    }
  }

  // Google 登入
  const loginWithGoogle = async (googleToken: string): Promise<boolean> => {
    try {
      console.log("loginWithGoogle")
      const config = useRuntimeConfig()
      
      const response = await $fetch<AuthResponse>(`${config.public.apiBaseUrl}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          idToken: googleToken
        }
      })

      if (response.success && response.token && response.vUserInfo) {
        token.value = response.token
        user.value = response.vUserInfo
        
        // 儲存到 localStorage
        if (import.meta.client) {
          localStorage.setItem('auth_token', response.token)
          localStorage.setItem('auth_user', JSON.stringify(response.vUserInfo))
        }
        
        // 開始定期檢查 token 過期
        startTokenExpiryCheck()
        
        return true
      }
      
      return false
    } catch (error) {
      console.error('Login failed:', error)
      return false
    }
  }

  // 登出
  const logout = () => {
    // 清除定期檢查
    clearTokenExpiryCheck()
    
    // 顯示對應的登出訊息
    const toastUiProps = {
      icon: "!size-10"
    }
    
    if (isAutoLogout.value) {
      toast.add({
        color: "warning",
        title: "登入已過期",
        icon: "heroicons-clock-20-solid",
        description: "您的登入已過期，請重新登入",
        duration: 4000,
        ui: toastUiProps,
      })
    } else {
      toast.add({
        color: "warning",
        title: "您已登出系統",
        icon: "heroicons-information-circle-16-solid",
        description: "期待您再次回來",
        duration: 3000,
        ui: toastUiProps,
      })
    }
    
    token.value = null
    user.value = null
    
    if (import.meta.client) {
      localStorage.removeItem("auth_token")
      localStorage.removeItem("auth_user")
    }
    
    // 重定向到首頁
    navigateTo('/')
  }

  // 驗證 token 是否有效
  const verifyToken = async (): Promise<boolean> => {
    console.log("verifyToken")
    if (!token.value) return false
    
    // 先檢查本地 token 是否已過期，避免不必要的 API 請求
    if (isTokenExpired(token.value)) {
      console.log('Token expired locally, logging out')
      logout()
      return false
    }
    
    try {
      const config = useRuntimeConfig()
      
      const response = await $fetch<TokenVerifyResponse>(`${config.public.apiBaseUrl}/api/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: token.value
      })
      
      return response.isValid
    } catch (error) {
      console.error('Token verification failed:', error)
      logout()
      return false
    }
  }

  // 自動初始化
  if (import.meta.client) {
    initAuth()
  }

  watch(isLoggedIn, (newVal) => {
    const toastUiProps = {
      icon: "!size-10"
    }
    if (newVal) {
      toast.add({
        color: "success",
        title: "您已成功登入系統",
        icon: "heroicons-check-circle-16-solid",
        description: `歡迎，${user.value?.userName || "用戶"}`,
        duration: 3000,
        ui: toastUiProps,
      });
    }
  });

  return {
    user: readonly(user),
    token: readonly(token),
    isLoggedIn,
    initAuth,
    loginWithGoogle,
    logout,
    verifyToken
  }
})