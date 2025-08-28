<template>
  <header class="bg-white shadow-md sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <div class="flex-shrink-0">
          <NuxtLink to="/" class="flex items-center">
            <div class="w-9 h-9 bg-blue-600 rounded-md flex items-center justify-center">
              <img src="~/assets/imgs/logo.png" alt="Logo">
            </div>
            <span class="ml-2 text-xl font-semibold text-gray-900">{{ $t("header.title") }}</span>
          </NuxtLink>
        </div>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex space-x-8">
          <!-- <NuxtLink 
            to="/" 
            class="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
          >
            {{ $t('nav.home') }}
          </NuxtLink>
          <NuxtLink 
            to="/about" 
            class="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
          >
            {{ $t('nav.about') }}
          </NuxtLink>
          <NuxtLink 
            to="/services" 
            class="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
          >
            {{ $t('nav.services') }}
          </NuxtLink>
          <NuxtLink 
            to="/contact" 
            class="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
          >
            {{ $t('nav.contact') }}
          </NuxtLink> -->

          <NuxtLink 
            to="/testpage" 
            class="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
          >
            TestPage
          </NuxtLink>
        </nav>

        <!-- Auth & Language Switcher & Mobile Menu Button -->
        <div class="flex items-center space-x-4">
          <!-- Language Switcher -->
          <div class="hidden sm:block">
            <UDropdownMenu
              :items="languageItems"
              :content="{ align: 'center', side: 'bottom', sideOffset: 8 }"
              :ui="{ content: 'w-24'}"
            >
              <UButton 
                variant="outline" 
                color="neutral"
              >
                <template #leading>
                  <UIcon name="i-heroicons-language" class="!size-5" />
                </template>
                {{ currentLocaleName }}
              </UButton>
            </UDropdownMenu>
          </div>
          <!-- User Menu (when logged in) -->
          <UIcon v-if="isLoading" name="i-svg-spinners-ring-resize" class="!size-6" />
          <div v-if="isLoggedIn && user" class="hidden sm:block">
            <UDropdownMenu
              :items="userMenuItems"
              :content="{ align: 'center', side: 'bottom', sideOffset: 8 }"
            >
              <UButton variant="ghost" color="neutral">
                <div class="flex items-center space-x-2">
                  <img 
                    v-if="user.picture" 
                    :src="user.picture" 
                    :alt="user.userName"
                    class="size-8 rounded-full"
                  >
                  <span class="hidden md:inline-block">{{ user.userName }}</span>
                </div>
              </UButton>
            </UDropdownMenu>
          </div>

          <!-- Login Menu (when not logged in) -->
          <div v-else class="hidden sm:block">
            <UDropdownMenu
              v-model:open="loginDropDownIsOpen"
              :items="loginMenuItems"
              :arrow="true"
              :ui="{ content: 'w-full' }"
            >
              <template #item>
                <div
                  id="google-signin-button-header"
                  ref="googleButtonContainer"
                  class="w-full"
                />
              </template>
              <UButton
                variant="outline"
                color="neutral"
              >
                <template #leading>
                  <UIcon name="i-heroicons-user-circle" class="!size-5" />
                </template>
                {{ $t('header.login') }}
              </UButton>       
            </UDropdownMenu>
          </div>

          <!-- Mobile Menu Button -->
          <UButton
            variant="ghost"
            color="neutral"
            class="md:hidden"
            :aria-label="$t('ui.menu')"
            @click="uiStore.toggleSidebar()"
          >
            <UIcon name="i-heroicons-bars-3" class="h-6 w-6" />
          </UButton>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const { $i18n } = useNuxtApp();

const uiStore = useUIStore()
const authStore = useAuthStore()
const { user, isLoggedIn } = storeToRefs(authStore)
const { logout } = authStore
const { locale, locales, setLocale } = $i18n

// Google Auth store
const googleAuthStore = useGoogleAuthStore()
const { isGoogleLoaded, isLoading, errorMessage } = storeToRefs(googleAuthStore)
const {
  initializeGoogle,
  renderGoogleButton,
  handleGoogleResponse,
  loadGoogleSDK,
  setErrorMessage
} = googleAuthStore

const config = useRuntimeConfig()

// 計算當前語言資訊
const currentLocaleName = computed(() => {
  const local = locales.value.find(l => l.code === locale.value)
  return local ? local.name : undefined;
})

// 語言選項格式化為 UDropdownMenu 所需的格式
const languageItems = computed(() => {
  return locales.value.map(l => ({
    value: l.code,
    label: l.name,
    type: 'checkbox' as const,
    checked: l.code === locale.value,
    onSelect: () => setLocale(l.code),
    onUpdateChecked(checked: boolean) {
      l.checked = checked;
    }
  }))
})

// 用戶選單項目
const userMenuItems = computed(() => [
  {
    label: '登出',
    icon: 'i-heroicons-arrow-right-start-on-rectangle-16-solid',
    onSelect: logout
  }
])

const loginMenuItems = computed(() => [
  {
    // label: $t('auth.loginWithGoogle'),
    // icon: 'i-logos-google-icon',
  }
])

// Google 登入相關邏輯
const googleClientId = config.public.googleClientId

// 環境變數檢查
if (!googleClientId) {
  console.error('Google Client ID not found. Please set GOOGLE_CLIENT_ID in your .env file')
  setErrorMessage('系統設定錯誤：找不到 Google Client ID')
}

const loginDropDownIsOpen = ref(false)

// 初始化 Google 登入
const initializeGoogleAuth = async () => {
  if (!googleClientId) {
    setErrorMessage('Google Client ID is required')
    return
  }
  try {
    // 載入 Google SDK
    const loaded = await loadGoogleSDK()
    if (!loaded) {
      setErrorMessage('Failed to load Google SDK')
      return
    }

    // 初始化 Google 登入
    const initialized = initializeGoogle()
    if (!initialized) {
      setErrorMessage('Failed to initialize Google Sign-In')
      return
    }
  } catch (error) {
    setErrorMessage(`Error during Google initialization: ${error}`)
  }
}

// Google 按鈕容器引用
const googleButtonContainer = ref<HTMLElement>()

// 渲染 Google 按鈕的函數
const renderGoogleButtonWhenReady = () => {
  if (isGoogleLoaded.value && googleButtonContainer.value && loginDropDownIsOpen.value) {
    // 清空容器內容，避免重複渲染
    // googleButtonContainer.value.innerHTML = ''
    const success = renderGoogleButton('google-signin-button-header')
    // console.log('Google button render result:', success)
  }
}

// 監聽登入 dropdown 開啟狀態
watch(loginDropDownIsOpen, (isOpen) => {
  if (isOpen && isGoogleLoaded.value) {
    nextTick(() => {
      renderGoogleButtonWhenReady()
    })
  }
})

// 載入時初始化 Google Auth
onMounted(() => {
  if (import.meta.client && googleClientId) {
    initializeGoogleAuth()
  }
})
</script>

