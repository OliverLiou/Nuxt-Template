<template>
  <UHeader
    :ui="{
      root: 'bg-white shadow-md sticky top-0 z-40',
      container: 'max-w-10xl px-4 sm:px-4 lg:px-6'
    }"
  >
    <!-- Logo 和標題 -->
    <template #left>
      <NuxtLink to="/" class="flex items-center">
        <div class="w-9 h-9 bg-blue-600 rounded-md flex items-center justify-center">
          <img src="/assets/imgs/logo.png" alt="Logo" class="w-full h-full object-contain">
        </div>
        <span class="ml-2 text-xl font-semibold text-gray-900">{{ $t("header.title") }}</span>
      </NuxtLink>
    </template>

    <!-- Desktop Navigation -->
    <template #default>
      <UNavigationMenu
        highlight
        highlight-color="secondary"
        color="secondary"
        class="w-full justify-center"
        content-orientation="vertical"
        :items="navMenuItems"
        :ui="{
          link: 'text-base',
          linkLeadingIcon: '!size-4',
          childLinkIcon: '!size-4'
        }"
      />
    </template>

    <!-- 右側設定選單 -->
    <template #right>
      <UDropdownMenu
        arrow
        v-model:open="settingDropDownIsOpen"
        :items="settingMenuItems"
      >
        <template #custom>
          <template v-if="isLoading">
            <UIcon name="i-svg-spinners-ring-resize" class="!size-8" />
          </template>
          <div v-if="!isLoggedIn && !user"
            id="google-signin-button-header"
            ref="googleButtonContainer"
            class="w-full"
          />
        </template>

        <UButton icon="heroicons-cog-6-tooth-solid" color="neutral" variant="ghost" :ui="{ leadingIcon: '!size-6' }" />
      </UDropdownMenu>
    </template>

    <!-- Mobile Menu 內容 (當 UHeader 的 menu 開啟時顯示) -->
    <template #body>
      <UNavigationMenu
        orientation="vertical"
        highlight-color="secondary"
        color="secondary"
        :items="navMenuItems"
        :ui="{
          link: 'text-base',
          linkLeadingIcon: '!size-4',
          childLinkIcon: '!size-4'
        }"
      />
    </template>
  </UHeader>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const { $i18n } = useNuxtApp()
const authStore = useAuthStore()
const { user, isLoggedIn } = storeToRefs(authStore)
const { logout } = authStore
const { locale, locales, setLocale } = $i18n

// Google Auth store
const googleAuthStore = useGoogleAuthStore()
const { isGoogleLoaded, isLoading } = storeToRefs(googleAuthStore)
const { initializeGoogle, renderGoogleButton, loadGoogleSDK, setErrorMessage } = googleAuthStore

const config = useRuntimeConfig()

const settingMenuItems = computed(() => {
  const { userName, picture } = user.value || {}
  const userDropdownItem = isLoggedIn.value && user.value ? [
    // 用戶選單項目
    {
      label: userName,
      avatar: {
        src: picture
      },
      children: [
        {
          label: $t('header.logOut'),
          icon: 'i-heroicons-arrow-right-start-on-rectangle-16-solid',
          onSelect: logout,
          ui: {
            itemLeadingIcon: "!size-5"
          }
        }
      ]
    }
  ] : [
    // 未登入用戶選單項目
    {
      slot: 'custom' as const
    }
  ]

  const languageDropdownItem = [
    {
      label: $t('header.language'),
      icon: 'i-heroicons-language',
      ui: {
        itemLeadingIcon: '!size-5'
      },
      children: locales.value.map(l => ({
        value: l.code,
        label: l.name,
        type: 'checkbox' as const,
        checked: l.code === locale.value,
        onSelect: () => setLocale(l.code),
        onUpdateChecked(checked: boolean) {
          l.checked = checked
        }
      }))
    }
  ]

  return [userDropdownItem, languageDropdownItem]
})

const navMenuItems = computed(() => {
  const allRoutes = useRouter().getRoutes()
  // console.log(allRoutes)
  const nav = $tm('nav') as any
  const navMaps = allRoutes.filter(s => s.path !== '/').map((s : any) => {
    const firstSegment = s.name.split('-')
    return {
      key: firstSegment[0],
      to: s.path,
      label: nav[`${s.path}`] && nav[`${s.path}`].label ? $t(`nav.${s.path}.label`) : $t(`nav.${s.path}`),
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
  return result
})

// Google 登入相關邏輯
const googleClientId = config.public.googleClientId

// 環境變數檢查
if (!googleClientId) {
  console.error('Google Client ID not found. Please set GOOGLE_CLIENT_ID in your .env file')
  setErrorMessage('系統設定錯誤：找不到 Google Client ID')
}
const settingDropDownIsOpen = ref(false)

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
  // console.log(isGoogleLoaded.value, googleButtonContainer.value, settingDropDownIsOpen.value)
  if (isGoogleLoaded.value && googleButtonContainer.value && settingDropDownIsOpen.value) {
    renderGoogleButton('google-signin-button-header')
  }
}

// 監聽登入 dropdown 開啟狀態
watch(settingDropDownIsOpen, (isOpen) => {
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

