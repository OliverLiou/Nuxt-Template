<template>
  <header class="bg-white shadow-md sticky top-0 z-40">
    <div class="mx-auto px-4 sm:px-6 lg:px-8">
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
        <div class="hidden content-start sm:flex">
          <UNavigationMenu
            highlight-color="secondary"
            color="secondary"
            class="justify-center"
            content-orientation="vertical"
            :items="navMenuItems"
            :ui="{ link: 'text-base font-bold' }"
          />
        </div>
        

        <!-- Auth & Language Switcher & Mobile Menu Button -->
        <div class="flex items-center space-x-4">
          <!-- User Menu (when logged in) -->
          <UIcon v-if="isLoading" name="i-svg-spinners-ring-resize" class="!size-7" />
          <div v-if="isLoggedIn && user" class="hidden sm:block">
            <UDropdownMenu
              :arrow="true"
              :items="userMenuItems"
              :content="{ align: 'center', side: 'bottom', sideOffset: 8 }"
            >
              <UButton variant="ghost" color="neutral">
                <UAvatar :src="user.picture" :alt="user.userName" class="size-6" />
                <span class="hidden md:inline-block">{{ user.userName }}</span>
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
              <UButton variant="ghost" color="neutral">
                <template #leading>
                  <UAvatar icon="i-heroicons-user-solid" :ui="{ icon: '!size-7'}" />
                </template>
              </UButton>       
            </UDropdownMenu>
          </div>

          <!-- Setting Menu -->
          <UDropdownMenu
            arrow
            :items="settingMenuItems"
          >
            <UButton icon="heroicons:cog-8-tooth-solid" color="neutral" variant="ghost" :ui="{ leadingIcon: '!size-6' }" />
          </UDropdownMenu>

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
import type { NavigationMenuItem } from '@nuxt/ui'

const { $i18n } = useNuxtApp();
const uiStore = useUIStore()
const authStore = useAuthStore()
const { user, isLoggedIn } = storeToRefs(authStore)
const { logout } = authStore
const { locale, locales, setLocale } = $i18n

// Google Auth store
const googleAuthStore = useGoogleAuthStore()
const { isGoogleLoaded, isLoading } = storeToRefs(googleAuthStore)
const { initializeGoogle, renderGoogleButton, loadGoogleSDK, setErrorMessage } = googleAuthStore

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

const settingMenuItems = reactive([
  {
    label: $t('header.language'),
    icon: 'i-heroicons-language',
    ui: {
      itemLeadingIcon: '!size-5'
    },
    children: languageItems
  }
])

const navMenuItems = computed(() => {
  const allRoutes = useRouter().getRoutes();
  // console.log(allRoutes)

  const navMaps = allRoutes.filter(s => s.path !== '/').map((s : any) => {
    const firstSegment = s.name.split("-")
    return {
      key: firstSegment[0],
      to: s.path,
      label: $t(`nav.${s.path}`),
      icon: s.meta.icon ?? null
    }
  })
  // console.log(navMaps)

  let result: NavigationMenuItem[] = []
  const { path } = useRoute()
  navMaps.forEach((item, index) => {
    if (item.to == `/${item.key}`) {
      result.push({
        label: item.label,
        to: item.to,
        icon: item.icon,
        children: navMaps.filter(s => index != navMaps.indexOf(s) && s.key == item.key),
        active: path.includes(item.to)
      }) 
    }
  })
  // console.log(result)

  return result;
})

// 用戶選單項目
const userMenuItems = computed(() => [
  {
    label: $t('header.logOut'),
    icon: 'i-heroicons-arrow-right-start-on-rectangle-16-solid',
    onSelect: logout,
    ui: {
      itemLeadingIcon: "!size-5"
    }
  }
])

const loginMenuItems = computed(() => [{}])

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
  // console.log(isGoogleLoaded.value, googleButtonContainer.value, loginDropDownIsOpen.value)
  if (isGoogleLoaded.value && googleButtonContainer.value && loginDropDownIsOpen.value) {
    renderGoogleButton('google-signin-button-header')
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

