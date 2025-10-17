# Coding Style Guide

此專案的 coding style 指南，基於 Nuxt 4.x 官方文檔和最佳實踐制定。

## 專案概覽

- **Framework**: Nuxt 4.0.3 + Vue 3.5.18 + TypeScript
- **UI Library**: Nuxt UI 4.0.1 (基於 Tailwind CSS v4.1.12)
- **狀態管理**: Pinia 3.0.3 (Composition API 風格)
- **國際化**: @nuxtjs/i18n 10.0.5
- **CSS**: Tailwind CSS 4.1.12
- **圖示庫**: @nuxt/icon 2.0.0
- **日期處理**: Moment.js 2.30.1
- **測試框架**: Vitest 0.33.0

## 檔案結構與組織

### 目錄結構
```
app/
├── components/           # Vue 元件（自動導入）
├── composables/          # Composables（自動導入）
├── pages/               # 頁面路由（檔案系統路由）
├── stores/              # Pinia 狀態管理
├── middleware/          # 路由中介軟體
├── plugins/             # Nuxt 插件
├── utils/               # 工具函數（自動導入）
├── assets/              # 靜態資源（CSS、圖片等）
└── app.vue              # 根元件

server/
├── api/                 # API 端點
├── middleware/          # Server 中介軟體
└── utils/               # Server 工具函數（自動導入）
```

### 命名慣例
- **檔案名稱**:
  - Vue 元件使用 PascalCase (如: `Header.vue`, `SideBar.vue`)
  - Composables 使用 camelCase，以 `use` 開頭 (如: `useAuth.ts`)
  - Utils 使用 camelCase (如: `formatDate.ts`)
  - Store 檔案使用 camelCase (如: `auth.ts`, `googleAuth.ts`)
- **目錄名稱**: 使用 camelCase 或 kebab-case
- **頁面路由**: 使用 kebab-case 或 camelCase

## Nuxt 4.x 核心特性

### 自動導入 (Auto-imports)

Nuxt 4 自動導入以下內容，**無需手動 import**：

#### 1. Vue 核心 API
```vue
<script setup lang="ts">
// ✅ 自動導入，無需 import
const count = ref(0)
const double = computed(() => count.value * 2)

onMounted(() => {
  console.log('Component mounted')
})

watch(count, (newVal) => {
  console.log('Count changed:', newVal)
})
</script>
```

#### 2. Nuxt Composables
```vue
<script setup lang="ts">
// ✅ 自動導入 Nuxt composables
const config = useRuntimeConfig()
const route = useRoute()
const router = useRouter()
const { $i18n } = useNuxtApp()

// ✅ 自動導入數據獲取
const { data, refresh } = await useFetch('/api/users')
</script>
```

#### 3. 自定義 Composables
```typescript
// composables/useCounter.ts
// ✅ 自動導入，檔名會轉為 camelCase
export const useCounter = () => {
  const count = ref(0)
  const increment = () => count.value++
  return { count, increment }
}
```

```vue
<script setup lang="ts">
// ✅ 直接使用，無需 import
const { count, increment } = useCounter()
</script>
```

#### 4. 顯式導入 (當需要時)
```vue
<script setup lang="ts">
// 使用 #imports 別名進行顯式導入
import { ref, computed } from '#imports'

const count = ref(1)
const double = computed(() => count.value * 2)
</script>
```

**何時使用顯式導入：**
- 需要覆寫自動導入的函數時
- 為了代碼可讀性和明確性
- 在 TypeScript 中需要更精確的類型推斷時

### 元件自動導入

```vue
<template>
  <!-- ✅ components/ 下的元件自動導入 -->
  <Header />
  <UButton>Click me</UButton>

  <!-- ✅ Nuxt UI 元件自動導入 -->
  <UCard>
    <UAlert>Alert message</UAlert>
  </UCard>
</template>

<script setup lang="ts">
// 無需 import Header, UButton, UCard, UAlert
</script>
```

## Vue 元件規範

### 元件結構順序
1. `<template>` 區塊在最上方
2. `<script setup lang="ts">` 區塊在中間
3. `<style scoped>` 區塊在最下方（如需要）

### Script 區塊組織順序

```vue
<script setup lang="ts">
// 1. 編譯器巨集（Compiler Macros）
definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

// 2. 型別/介面定義
interface User {
  id: string
  userName: string
  email: string
  picture?: string
}

// 3. Props & Emits
const props = defineProps<{
  userId: string
  showDetails?: boolean
}>()

const emit = defineEmits<{
  update: [user: User]
  close: []
}>()

// 4. Nuxt composables
const config = useRuntimeConfig()
const route = useRoute()
const { $i18n } = useNuxtApp()

// 5. Store 使用
const authStore = useAuthStore()
const { user, isLoggedIn } = storeToRefs(authStore)

// 6. 數據獲取
const { data: userData } = await useFetch(`/api/users/${props.userId}`)

// 7. 響應式變數
const isOpen = ref(false)
const selectedItem = ref<User | null>(null)

// 8. 計算屬性
const displayName = computed(() => {
  return user.value?.userName || 'Guest'
})

// 9. 方法定義
const handleUpdate = () => {
  emit('update', user.value)
}

// 10. 生命週期鉤子
onMounted(() => {
  console.log('Component mounted')
})

// 11. 監聽器
watch(isOpen, (newVal) => {
  console.log('isOpen changed:', newVal)
})
</script>
```

### 頁面元件規範

```vue
<script setup lang="ts">
// ✅ 使用 definePageMeta 定義頁面元資料
definePageMeta({
  middleware: 'auth',
  layout: 'dashboard',
  // 使用方括號語法定義動態屬性
  ['icon']: 'lucide:file-text',
  ['requiresAuth']: true
})

// 頁面邏輯
const { data } = await useFetch('/api/page-data')
</script>

<template>
  <div>
    <h1>{{ $t('pages.title') }}</h1>
  </div>
</template>
```

## TypeScript 規範

### 介面定義

```typescript
// ✅ 使用 interface 定義物件結構
interface User {
  id: string
  userName: string
  email: string
  picture?: string  // 可選屬性使用 ?
  readonly createdAt: Date  // 只讀屬性
}

// ✅ API 回應型別
interface AuthResponse {
  success: boolean
  message: string
  token?: string
  user?: User
}

// ✅ 組件 Props 型別
interface ButtonProps {
  variant?: 'solid' | 'outline' | 'ghost'
  color?: 'primary' | 'secondary' | 'neutral'
  disabled?: boolean
}
```

### 型別註解最佳實踐

```typescript
// ✅ 函數參數明確標註型別
const loginWithGoogle = async (googleToken: string): Promise<boolean> => {
  // ...
}

// ✅ 響應式變數使用泛型
const user = ref<User | null>(null)
const users = ref<User[]>([])

// ✅ 計算屬性依賴型別推斷（通常不需要手動標註）
const isLoggedIn = computed(() => !!user.value)

// ✅ API 呼叫使用泛型標註回應型別
const { data } = await useFetch<AuthResponse>('/api/auth/google', {
  method: 'POST',
  body: { token: googleToken }
})

// ✅ 事件處理器型別
const handleClick = (event: MouseEvent) => {
  console.log(event.target)
}
```

### Nuxt 4 自動生成型別

Nuxt 4 會自動生成型別定義檔案：
- `.nuxt/types/components.d.ts` - 元件型別
- `.nuxt/types/imports.d.ts` - 自動導入型別
- `.nuxt/tsconfig.json` - TypeScript 配置

```typescript
// ✅ 可以直接使用自動生成的型別
// 無需手動定義，Nuxt 會自動處理
```

## Pinia Store 規範

### Store 結構 (Composition API 風格)

```typescript
// stores/auth.ts
export const useAuthStore = defineStore('auth', () => {
  // 1. 狀態定義
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)

  // 2. 計算屬性（Getters）
  const isLoggedIn = computed(() => !!token.value)
  const userName = computed(() => user.value?.userName || 'Guest')

  // 3. 方法定義（Actions）
  const loginWithGoogle = async (googleToken: string) => {
    try {
      const response = await $fetch<AuthResponse>('/api/auth/google', {
        method: 'POST',
        body: { token: googleToken }
      })

      if (response.success) {
        token.value = response.token
        user.value = response.user
        return true
      }
      return false
    } catch (error) {
      console.error('Login failed:', error)
      return false
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    // 清除 localStorage
    if (import.meta.client) {
      localStorage.removeItem('auth_token')
    }
  }

  // 4. 初始化邏輯（僅在客戶端執行）
  if (import.meta.client) {
    const savedToken = localStorage.getItem('auth_token')
    if (savedToken) {
      token.value = savedToken
    }
  }

  // 5. 監聽器
  watch(token, (newToken) => {
    if (import.meta.client) {
      if (newToken) {
        localStorage.setItem('auth_token', newToken)
      } else {
        localStorage.removeItem('auth_token')
      }
    }
  })

  // 6. 回傳暴露的狀態和方法
  return {
    // 只讀狀態（使用 readonly 防止外部修改）
    user: readonly(user),
    token: readonly(token),
    // 計算屬性
    isLoggedIn,
    userName,
    // 方法
    loginWithGoogle,
    logout
  }
})
```

### Store 使用

```vue
<script setup lang="ts">
// ✅ 使用 store
const authStore = useAuthStore()

// ✅ 使用 storeToRefs 解構響應式狀態
const { user, isLoggedIn } = storeToRefs(authStore)

// ✅ 直接解構方法（不需要 storeToRefs）
const { loginWithGoogle, logout } = authStore
</script>
```

## 程式碼風格

### 引號與分號
- 使用**單引號** (`'`) 作為字串
- **不使用分號**結尾

```typescript
// ✅ 正確
const message = 'Hello World'
const greeting = `Welcome, ${userName}`

// ❌ 錯誤
const message = "Hello World";
```

### 物件與陣列

```typescript
// ✅ 物件屬性對齊
const config = {
  success: true,
  message: 'Operation successful',
  data: { id: 1, name: 'John' }
}

// ✅ 陣列換行格式
const menuItems = [
  { label: 'Home', to: '/', icon: 'i-lucide-home' },
  { label: 'About', to: '/about', icon: 'i-lucide-info' }
]

// ✅ 較長的物件使用換行
const userProfile = {
  id: '123',
  userName: 'johndoe',
  email: 'john@example.com',
  preferences: {
    theme: 'dark',
    language: 'zh_TW'
  }
}
```

### 函數定義

```typescript
// ✅ 優先使用箭頭函數
const handleClick = () => {
  console.log('Clicked')
}

const processData = async (data: any) => {
  return await transformData(data)
}

// ✅ computed 使用箭頭函數
const userMenuItems = computed(() => [
  { label: 'Profile', icon: 'i-lucide-user' },
  { label: 'Settings', icon: 'i-lucide-settings' }
])

// ✅ 複雜邏輯使用命名函數
function calculateComplexValue(input: number): number {
  // 複雜計算邏輯
  return input * 2
}
```

### 條件判斷

```typescript
// ✅ 使用三元運算子處理簡單條件
const statusClass = isActive ? 'active' : 'inactive'
const iconName = isLoading ? 'i-svg-spinners-90-ring-with-bg' : 'i-lucide-check'

// ✅ 複雜條件使用 if-else
if (response.success && response.token && response.user) {
  // 處理成功邏輯
  token.value = response.token
  user.value = response.user
} else {
  // 處理失敗邏輯
  console.error('Authentication failed')
}

// ✅ 多條件使用 switch
switch (status) {
  case 'pending':
    return 'i-lucide-clock'
  case 'success':
    return 'i-lucide-check'
  case 'error':
    return 'i-lucide-x'
  default:
    return 'i-lucide-help-circle'
}
```

## Tailwind CSS v4 規範

### CSS 導入方式

```css
/* assets/css/main.css */
@import "tailwindcss";
@import "@nuxt/ui";

/* 自定義設計系統 */
@theme {
  /* 自定義字體 */
  --font-sans: 'Public Sans', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* 自定義斷點 */
  --breakpoint-3xl: 1920px;
  --breakpoint-4xl: 2560px;

  /* 自定義顏色（需定義 50-950 的所有色階） */
  --color-brand-50: #fef2f2;
  --color-brand-100: #fee2e2;
  --color-brand-200: #fecaca;
  --color-brand-300: #fca5a5;
  --color-brand-400: #f87171;
  --color-brand-500: #ef4444;
  --color-brand-600: #dc2626;
  --color-brand-700: #b91c1c;
  --color-brand-800: #991b1b;
  --color-brand-900: #7f1d1d;
  --color-brand-950: #450a0a;
}

/* 自定義全域樣式 */
:root {
  --ui-radius: 0.5rem;
  --ui-container: var(--container-2xl);
}
```

### Tailwind 類別使用順序

**遵循以下順序組織 CSS 類別：**

1. **佈局**: `flex`, `grid`, `block`, `inline-flex`
2. **定位**: `absolute`, `relative`, `fixed`, `sticky`
3. **尺寸**: `w-*`, `h-*`, `size-*`, `min-w-*`, `max-w-*`
4. **間距**: `m-*`, `p-*`, `space-*`, `gap-*`
5. **顏色**: `bg-*`, `text-*`, `border-*`
6. **邊框**: `border`, `border-*`, `rounded-*`
7. **其他**: `shadow-*`, `transition-*`, `opacity-*`

```vue
<template>
  <!-- ✅ 正確的類別順序 -->
  <div class="flex items-center justify-between w-full p-4 bg-white border border-gray-200 rounded-lg shadow-md">
    <span class="text-lg font-semibold text-gray-900">Title</span>
  </div>
</template>
```

### 響應式設計

```vue
<template>
  <!-- ✅ 行動優先設計 -->
  <div class="block md:flex lg:grid">
    <!-- 行動版: block -->
    <!-- 平板: flex -->
    <!-- 桌面: grid -->
  </div>

  <!-- ✅ 顯示/隱藏 -->
  <div class="block md:hidden">行動版顯示</div>
  <div class="hidden md:block">桌面版顯示</div>

  <!-- ✅ 響應式間距 -->
  <div class="p-4 md:p-6 lg:p-8">
    Responsive padding
  </div>
</template>
```

### Nuxt UI 語義化顏色

```vue
<template>
  <!-- ✅ 使用 Nuxt UI 提供的語義化顏色 -->
  <span class="text-primary">Primary color</span>
  <span class="text-secondary">Secondary color</span>
  <span class="text-success">Success message</span>
  <span class="text-info">Info message</span>
  <span class="text-warning">Warning message</span>
  <span class="text-error">Error message</span>

  <!-- ✅ 背景顏色 -->
  <div class="bg-primary text-white">Primary background</div>

  <!-- ✅ 中性色（替代原 gray） -->
  <div class="bg-neutral-100 text-neutral-900">
    Neutral colors
  </div>
</template>
```

## Nuxt UI 4.0 元件規範

### 元件自定義方式

#### 1. 使用 Props

```vue
<template>
  <!-- ✅ 使用內建 props -->
  <UButton
    color="primary"
    variant="solid"
    size="lg"
    icon="i-lucide-plus"
    :disabled="isLoading"
    @click="handleClick"
  >
    新增項目
  </UButton>
</template>
```

#### 2. 使用 `ui` Prop 自定義

```vue
<template>
  <!-- ✅ 使用 ui prop 覆寫預設樣式 -->
  <UInput
    v-model="email"
    placeholder="輸入電子郵件"
    :ui="{
      base: 'custom-input-class',
      rounded: 'rounded-full',
      padding: 'px-4 py-3'
    }"
  />

  <!-- ✅ 使用 ui prop 的 slots 系統 -->
  <UButton
    :ui="{
      base: 'font-bold tracking-wide uppercase',
      label: 'font-semibold text-sm'
    }"
  >
    Custom Button
  </UButton>
</template>
```

#### 3. 全域主題自定義 (app.config.ts)

```typescript
// app.config.ts
export default defineAppConfig({
  ui: {
    // 自定義 Button 元件
    button: {
      slots: {
        base: 'font-bold tracking-wide',
        label: 'font-semibold'
      },
      variants: {
        color: {
          brand: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
        },
        size: {
          '2xl': {
            base: 'px-6 py-3 text-xl gap-3',
            leadingIcon: 'size-8',
            trailingIcon: 'size-8'
          }
        }
      },
      compoundVariants: [
        {
          color: 'brand',
          variant: 'outline',
          class: 'ring-2 ring-purple-500 text-purple-500'
        }
      ],
      defaultVariants: {
        color: 'primary',
        variant: 'solid'
      }
    },

    // 自定義 Card 元件
    card: {
      slots: {
        base: 'overflow-hidden',
        header: 'border-b border-neutral-200',
        body: 'p-6'
      }
    }
  }
})
```

### 元件使用最佳實踐

```vue
<template>
  <!-- ✅ 優先使用 Nuxt UI 元件 -->
  <UCard>
    <template #header>
      <h2 class="text-lg font-semibold">Card Title</h2>
    </template>

    <UAlert
      color="success"
      variant="soft"
      icon="i-lucide-check-circle"
      title="操作成功"
      description="您的資料已成功儲存"
    />

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton variant="outline" @click="handleCancel">
          取消
        </UButton>
        <UButton @click="handleSubmit">
          確認
        </UButton>
      </div>
    </template>
  </UCard>
</template>
```

## 國際化 (i18n) 規範

### Nuxt Config 配置

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  i18n: {
    defaultLocale: 'en',
    detectBrowserLanguage: false,
    strategy: 'no_prefix',  // 或 'prefix', 'prefix_except_default'
    locales: [
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'zh_TW', name: '繁體中文', file: 'zh_TW.json' }
    ],
    // 實驗性功能
    experimental: {
      typedPages: true,  // 啟用型別化頁面
      typedOptionsAndMessages: 'default'  // 啟用型別化訊息
    }
  }
})
```

### 翻譯檔案結構

```json
{
  "nav": {
    "home": "首頁",
    "about": "關於",
    "contact": "聯絡我們"
  },
  "pages": {
    "home": {
      "title": "歡迎來到首頁",
      "description": "這是首頁的描述"
    }
  },
  "ui": {
    "button": {
      "submit": "提交",
      "cancel": "取消",
      "save": "儲存"
    }
  }
}
```

### Composables 使用方式

#### 1. useI18n - 翻譯文字

```vue
<script setup lang="ts">
// ✅ 自動導入，無需手動 import
const { t, locale, locales } = useI18n()

// 翻譯文字
const title = t('pages.home.title')

// 帶參數的翻譯
const greeting = t('greeting', { name: 'John' })

// 切換語言
const switchLanguage = (code: string) => {
  locale.value = code
}
</script>

<template>
  <div>
    <!-- ✅ 在 template 中使用 $t -->
    <h1>{{ $t('pages.home.title') }}</h1>
    <p>{{ $t('pages.home.description') }}</p>
  </div>
</template>
```

#### 2. useLocalePath - 本地化路徑

```vue
<script setup lang="ts">
const localePath = useLocalePath()

// 生成本地化路徑
const aboutPath = localePath('/about')
// 結果: /zh_TW/about (取決於當前語言)
</script>

<template>
  <!-- ✅ 在 template 中使用 -->
  <UButton :to="localePath('/about')">
    {{ $t('nav.about') }}
  </UButton>
</template>
```

#### 3. useSwitchLocalePath - 切換語言路徑

```vue
<script setup lang="ts">
const switchLocalePath = useSwitchLocalePath()
const { locale, locales } = useI18n()
</script>

<template>
  <!-- ✅ 語言切換選單 -->
  <UDropdownMenu>
    <template #trigger>
      <UButton>{{ locale }}</UButton>
    </template>

    <UDropdownMenuItem
      v-for="loc in locales"
      :key="loc.code"
      :to="switchLocalePath(loc.code)"
    >
      {{ loc.name }}
    </UDropdownMenuItem>
  </UDropdownMenu>
</template>
```

#### 4. useLocaleRoute - 本地化路由

```vue
<script setup lang="ts">
const localeRoute = useLocaleRoute()
const { locale } = useI18n()

const navigateToProfile = () => {
  const route = localeRoute({
    name: 'user-profile',
    params: { id: '123' },
    query: { tab: 'settings' }
  }, locale.value)

  if (route) {
    navigateTo(route.fullPath)
  }
}
</script>
```

#### 5. useLocaleHead - SEO 本地化

```vue
<script setup lang="ts">
// ✅ 設置本地化的 SEO meta tags
const i18nHead = useLocaleHead({
  seo: {
    canonicalQueries: ['page', 'sort']  // 保留的查詢參數
  }
})

useHead(() => ({
  htmlAttrs: {
    lang: i18nHead.value.htmlAttrs?.lang
  },
  link: [...(i18nHead.value.link || [])],
  meta: [...(i18nHead.value.meta || [])]
}))
</script>
```

## 註解規範

### 中文註解
- 使用**繁體中文**撰寫註解
- 註解說明關鍵邏輯和業務需求
- 複雜演算法需要詳細註解

```typescript
// ✅ 解析 JWT payload
const parseJwtPayload = (token: string) => {
  const base64Url = token.split('.')[1]
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  return JSON.parse(atob(base64))
}

// ✅ 檢查 token 是否已過期
const isTokenExpired = (token: string): boolean => {
  const payload = parseJwtPayload(token)
  const expiryTime = payload.exp * 1000
  return Date.now() >= expiryTime
}

// ✅ 每 5 分鐘檢查一次 token 是否過期
const tokenExpiryInterval = setInterval(() => {
  if (token.value && isTokenExpired(token.value)) {
    logout()
  }
}, 5 * 60 * 1000)
```

### JSDoc 註解

```typescript
/**
 * 發送 Google OAuth 登入請求
 * @param googleToken - Google 提供的 OAuth token
 * @returns 登入是否成功
 * @throws 當網路請求失敗時
 */
const loginWithGoogle = async (googleToken: string): Promise<boolean> => {
  // 實作邏輯
}

/**
 * 用戶資料介面
 * @interface User
 * @property {string} id - 用戶唯一識別碼
 * @property {string} userName - 用戶名稱
 * @property {string} email - 電子郵件地址
 */
interface User {
  id: string
  userName: string
  email: string
}
```

## 錯誤處理

### Try-Catch 使用

```typescript
// ✅ API 請求錯誤處理
const fetchUserData = async (userId: string) => {
  try {
    const { data } = await useFetch<User>(`/api/users/${userId}`)
    return data.value
  } catch (error) {
    console.error('Failed to fetch user data:', error)
    // 顯示錯誤訊息給用戶
    const toast = useToast()
    toast.add({
      color: 'error',
      title: '載入失敗',
      description: '無法載入用戶資料，請稍後再試'
    })
    return null
  }
}

// ✅ 表單驗證錯誤處理
const handleSubmit = async () => {
  try {
    // 驗證表單
    if (!email.value) {
      throw new Error('請輸入電子郵件')
    }

    // 提交資料
    await submitForm()
  } catch (error) {
    if (error instanceof Error) {
      console.error('Form submission error:', error.message)
    }
  }
}
```

### Toast 通知

```typescript
const toast = useToast()

// ✅ 成功訊息
toast.add({
  color: 'success',
  title: '操作成功',
  icon: 'i-lucide-check-circle',
  description: '您的資料已成功儲存',
  duration: 3000
})

// ✅ 錯誤訊息
toast.add({
  color: 'error',
  title: '操作失敗',
  icon: 'i-lucide-x-circle',
  description: '發生錯誤，請稍後再試',
  duration: 5000
})

// ✅ 警告訊息
toast.add({
  color: 'warning',
  title: '注意',
  icon: 'i-lucide-alert-triangle',
  description: '此操作無法復原',
  duration: 4000
})

// ✅ 資訊訊息
toast.add({
  color: 'info',
  title: '提示',
  icon: 'i-lucide-info',
  description: '您有新訊息'
})
```

## 環境配置

### Runtime Config

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    // ❌ 私有配置（僅 server 端可用）
    apiSecret: process.env.API_SECRET,

    // ✅ 公開配置（client 和 server 都可用）
    public: {
      googleClientId: process.env.GOOGLE_CLIENT_ID,
      apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:5001'
    }
  }
})
```

### 使用方式

```vue
<script setup lang="ts">
// ✅ 取得 runtime config
const config = useRuntimeConfig()

// ✅ 使用公開配置
const apiUrl = config.public.apiBaseUrl
const clientId = config.public.googleClientId

// ✅ 在 API 請求中使用
const { data } = await useFetch(`${config.public.apiBaseUrl}/api/users`)
</script>
```

### .env 檔案

```bash
# .env
GOOGLE_CLIENT_ID=your_google_client_id
API_BASE_URL=http://localhost:5001
API_SECRET=your_secret_key
```

## 效能最佳化

### Lazy Loading

```vue
<script setup lang="ts">
// ✅ Lazy load 元件
const LazyHeavyComponent = defineAsyncComponent(() =>
  import('~/components/HeavyComponent.vue')
)

// ✅ Lazy load 在需要時才載入
const showHeavyComponent = ref(false)
</script>

<template>
  <div>
    <UButton @click="showHeavyComponent = true">
      載入元件
    </UButton>

    <LazyHeavyComponent v-if="showHeavyComponent" />
  </div>
</template>
```

### useLazyFetch / useLazyAsyncData

```vue
<script setup lang="ts">
// ✅ 使用 lazy fetch，不會阻塞頁面渲染
const { data, pending, refresh } = useLazyFetch('/api/heavy-data')
</script>

<template>
  <div>
    <div v-if="pending">載入中...</div>
    <div v-else>{{ data }}</div>
  </div>
</template>
```

### 圖片最佳化

```vue
<template>
  <!-- ✅ 使用 NuxtImg 自動最佳化圖片 -->
  <NuxtImg
    src="/images/hero.jpg"
    alt="Hero image"
    width="800"
    height="600"
    loading="lazy"
    format="webp"
  />
</template>
```

## 總結

此 coding style 強調：

1. **自動導入優先**: 充分利用 Nuxt 4.x 的自動導入功能
2. **型別安全**: 完整的 TypeScript 型別定義和推斷
3. **組件化**: 優先使用 Nuxt UI 元件，保持一致性
4. **國際化**: 使用最新的 i18n composables
5. **效能**: 合理使用 lazy loading 和程式碼分割
6. **可讀性**: 清晰的程式碼組織和中文註解
7. **現代化**: 使用 Composition API 和最新的 Vue 3 / Nuxt 4 特性
8. **可維護性**: 遵循一致的命名和結構規範

遵循此指南有助於維持程式碼品質、提升開發效率和團隊協作。
