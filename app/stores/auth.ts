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
  
  const isLoggedIn = computed(() => !!token.value)
  const toast = useToast();

  // 初始化認證狀態
  const initAuth = () => {
    if (import.meta.client) {
      const savedToken = localStorage.getItem('auth_token')
      const savedUser = localStorage.getItem('auth_user')
      
      if (savedToken && savedUser) {
        token.value = savedToken
        user.value = JSON.parse(savedUser)
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
        title: `您已成功登入系統`,
        icon: "heroicons-information-circle-16-solid",
        description: `歡迎，${user.value?.userName || "用戶"}`,
        duration: 3000,
        ui: toastUiProps,
      });
    } else {
      toast.add({
        color: "warning",
        title: `你已登出系統`,
        icon: "heroicons-information-circle-16-solid",
        description: "期待您再次回來",
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