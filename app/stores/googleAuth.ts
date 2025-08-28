import { defineStore } from 'pinia'

// Google 登入相關類型定義
interface GoogleCredentialResponse {
  credential: string
  select_by: string
  clientId?: string
}

interface GoogleIdConfiguration {
  client_id: string
  auto_select?: boolean
  callback?: (credentialResponse: GoogleCredentialResponse) => void
  cancel_on_tap_outside?: boolean
  context?: string,
}

interface GoogleButtonConfiguration {
  type?: 'standard' | 'icon'
  theme?: 'outline' | 'filled_blue' | 'filled_black'
  size?: 'large' | 'medium' | 'small'
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
  shape?: 'rectangular' | 'pill' | 'circle' | 'square'
  locale?: 'en' | 'zh_TW' | 'fr'
  width?: string | number
}

interface GoogleAccounts {
  id: {
    initialize: (config: GoogleIdConfiguration) => void
    prompt: (momentListener?: (notification: any) => void) => void
    renderButton: (parent: HTMLElement, options: GoogleButtonConfiguration) => void
    cancel: () => void
  }
}

interface WindowWithGoogle extends Window {
  google?: {
    accounts: GoogleAccounts
  }
}

export const useGoogleAuthStore = defineStore('googleAuth', () => {
  const { locale } = useI18n()
  const authStore = useAuthStore()
  const { loginWithGoogle } = authStore
  const config = useRuntimeConfig()
  
  const isGoogleLoaded = ref(false)
  const isLoading = ref(false)
  const errorMessage = ref()
  
  const toast = useToast();
  // 獲取 Google 物件 (使用類型斷言避免 TypeScript 錯誤)
  const getGoogleObject = () => {
    const windowWithGoogle = window as WindowWithGoogle
    return windowWithGoogle.google
  }

  // 檢查 Google 是否已載入
  const checkGoogleLoaded = () => {
    if (!import.meta.client) return false
    const google = getGoogleObject()
    return !!(google && google.accounts && google.accounts.id)
  }

  // 初始化 Google 登入
  const initializeGoogle = () => {  
    if (!import.meta.client) {
      console.error('Cannot initialize Google on server side')
      return false
    }

    const googleClientId = config.public.googleClientId
    if (!googleClientId) {
      console.error('Google Client ID not found')
      errorMessage.value = '系統設定錯誤：找不到 Google Client ID'
      return false
    }

    const google = getGoogleObject()
    if (!google) {
      console.error('Google object not found')
      errorMessage.value = 'Google 服務未載入'
      return false
    }

    try {
      google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: false,
        context: "signin",
      });
      
      isGoogleLoaded.value = true
      console.log('Google Sign-In initialized successfully')
      return true
    } catch (error) {
      console.error('Failed to initialize Google Sign-In:', error)
      errorMessage.value = 'Google 登入初始化失敗'
      return false
    }
  }

  // 渲染 Google 按鈕
  const renderGoogleButton = (containerId: string, options?: Partial<GoogleButtonConfiguration>) => {
    if (!isGoogleLoaded.value) {
      console.error('Google not loaded yet')
      setErrorMessage('Google 服務未載入')
      return false
    }

    const container = document.getElementById(containerId)
    if (!container) {
      console.error(`Container with id '${containerId}' not found`)
      return false
    }

    const google = getGoogleObject()
    if (!google) return false

    try {
      const defaultOptions: GoogleButtonConfiguration = {
        theme: "outline",
        size: "medium",
        type: "standard",
        text: "signin_with",
        shape: "rectangular",
        locale: locale.value,
      };
      
      google.accounts.id.renderButton(container, { ...defaultOptions, ...options })
      // console.log('renderGoogleButton successfully')
      return true
    } catch (error) {
      console.error('Failed to render Google button:', error)
      return false
    }
  }

  // 處理 Google 登入回應
  const handleGoogleResponse = async (response: GoogleCredentialResponse) => {
    // console.log('Google credential response received:', response)
    
    if (!response.credential) {
      console.error('No credential received from Google')
      errorMessage.value = '未收到 Google 憑證'
      return false
    }

    isLoading.value = true
    errorMessage.value = ''

    try {
      const success = await loginWithGoogle(response.credential)
      
      if (success) {
        console.log('Login successful')
        return true
      } else {
        errorMessage.value = '登入失敗，請檢查網路連線或稍後再試'
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      errorMessage.value = '登入過程中發生錯誤，請稍後再試'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // 載入 Google SDK
  const loadGoogleSDK = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!import.meta.client) {
        resolve(false)
        return
      }

      // 檢查是否已經載入
      if (checkGoogleLoaded()) {
        resolve(true)
        return
      }

      // 動態載入 Google Identity Services
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      
      script.onload = () => {
        console.log('Google GSI script loaded')
        // 等待一下讓 Google 物件完全初始化
        setTimeout(() => {
          resolve(checkGoogleLoaded())
        }, 100)
      }
      
      script.onerror = (error) => {
        console.error('Failed to load Google GSI script:', error)
        errorMessage.value = '無法載入 Google 登入服務'
        resolve(false)
      }
      
      document.head.appendChild(script)
    })
  }

  // 設定錯誤訊息
  const setErrorMessage = (message: string) => {
    errorMessage.value = message
  }

  watch(errorMessage, (newMessage) => {
    if (newMessage) {
      toast.add({
        title: newMessage,
        duration: 5000,
        color: "error",
        icon: "logos:google-icon",
      });
    }
  })

  return {
    isGoogleLoaded: readonly(isGoogleLoaded),
    isLoading: readonly(isLoading),
    errorMessage: readonly(errorMessage),
    initializeGoogle,
    renderGoogleButton,
    handleGoogleResponse,
    loadGoogleSDK,
    checkGoogleLoaded,
    setErrorMessage,
  };
})