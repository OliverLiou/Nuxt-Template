# Coding Style Guide

此專案的 coding style 指南，基於現有程式碼分析制定。

## 專案概覽

- **Framework**: Nuxt 4.x + Vue 3.x + TypeScript
- **UI Library**: Nuxt UI (基於 Tailwind CSS)
- **狀態管理**: Pinia (Composition API 風格)
- **國際化**: @nuxtjs/i18n
- **CSS**: Tailwind CSS 4.x

## 檔案結構與組織

### 目錄結構
```
app/
├── components/           # Vue 元件
├── pages/               # 頁面路由
├── stores/              # Pinia 狀態管理
├── middleware/          # 路由中介軟體
├── plugins/             # Nuxt 插件
└── assets/             # 靜態資源
```

### 命名慣例
- **檔案名稱**: 使用 PascalCase (如: `Header.vue`, `SideBar.vue`)
- **目錄名稱**: 使用 camelCase (如: `DropDownPage`)
- **Store 檔案**: 使用 camelCase (如: `auth.ts`, `googleAuth.ts`)

## Vue 元件規範

### 元件結構
1. `<template>` 區塊在最上方
2. `<script setup lang="ts">` 區塊在中間
3. `<style scoped>` 區塊在最下方 (如需要)

### Script 區塊組織順序
```typescript
// 1. 型別/介面定義
interface User {
  id: string
  userName: string
  email: string
  picture?: string
}

// 2. Nuxt 相關 composables
const { $i18n } = useNuxtApp()
const config = useRuntimeConfig()

// 3. Store 使用
const authStore = useAuthStore()
const { user, isLoggedIn } = storeToRefs(authStore)

// 4. 響應式變數
const loginDropDownIsOpen = ref(false)
const googleButtonContainer = ref<HTMLElement>()

// 5. 計算屬性
const userMenuItems = computed(() => [...])

// 6. 方法定義
const initializeGoogleAuth = async () => {...}

// 7. 生命週期鉤子
onMounted(() => {...})

// 8. 監聽器
watch(loginDropDownIsOpen, (isOpen) => {...})
```

### 頁面元件規範
```vue
<script setup lang="ts">
// 頁面元資料定義
definePageMeta({
  middleware: 'auth',
  ['icon']: 'lucide:file-text'  // 使用方括號語法定義動態屬性
})
</script>
```

## TypeScript 規範

### 介面定義
```typescript
// 使用 interface 定義物件結構
interface User {
  id: string
  userName: string
  email: string
  picture?: string  // 可選屬性使用 ?
}

// API 回應型別
interface AuthResponse {
  success: boolean
  message: string
  token?: string
  vUserInfo?: User
}
```

### 型別註解
- **函數參數**: 明確標註型別
- **響應式變數**: 使用泛型標註 `ref<Type | null>`
- **計算屬性**: 通常依賴型別推斷
- **API 呼叫**: 使用泛型標註回應型別

```typescript
const user = ref<User | null>(null)
const loginWithGoogle = async (googleToken: string): Promise<boolean> => {...}
const response = await $fetch<AuthResponse>(`${config.public.apiBaseUrl}/api/auth/google`)
```

## Pinia Store 規範

### Store 結構 (Composition API 風格)
```typescript
export const useAuthStore = defineStore('auth', () => {
  // 1. 狀態定義
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)

  // 2. 計算屬性
  const isLoggedIn = computed(() => !!token.value)

  // 3. 方法定義
  const loginWithGoogle = async (googleToken: string) => {...}
  const logout = () => {...}

  // 4. 初始化邏輯
  if (import.meta.client) {
    initAuth()
  }

  // 5. 監聽器
  watch(isLoggedIn, (newVal) => {...})

  // 6. 回傳暴露的狀態和方法
  return {
    user: readonly(user),  // 只讀狀態
    token: readonly(token),
    isLoggedIn,
    loginWithGoogle,
    logout
  }
})
```

## 程式碼風格

### 引號與分號
- 使用**單引號** (`'`) 作為字串
- **不使用分號**結尾

### 物件與陣列
```typescript
// 物件屬性對齊
const config = {
  success: true,
  message: 'Login successful',
  token: 'abc123'
}

// 陣列換行格式
const menuItems = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' }
]
```

### 函數定義
```typescript
// 優先使用箭頭函數
const handleClick = () => {...}
const processData = async (data: any) => {...}

// computed 使用箭頭函數
const userMenuItems = computed(() => [...])
```

### 條件判斷
```typescript
// 使用三元運算子處理簡單條件
const iconClass = isLoading ? 'loading' : 'idle'

// 複雜條件使用 if-else
if (response.success && response.token && response.vUserInfo) {
  // 處理成功邏輯
} else {
  // 處理失敗邏輯
}
```

## Tailwind CSS 規範

### 類別順序
1. **佈局**: `flex`, `grid`, `block`, `inline`
2. **定位**: `absolute`, `relative`, `fixed`
3. **尺寸**: `w-`, `h-`, `size-`
4. **間距**: `m-`, `p-`, `space-`
5. **顏色**: `bg-`, `text-`, `border-`
6. **其他**: `rounded`, `shadow`, `transition`

### 響應式設計
```html
<!-- 行動優先設計 -->
<div class="block md:hidden">  <!-- 行動版顯示，桌面版隱藏 -->
<div class="hidden sm:block">  <!-- 行動版隱藏，小螢幕以上顯示 -->
```

## 國際化 (i18n) 規範

### 翻譯鍵值結構
```json
{
  "nav": {
    "/Page1": "Page1",
    "/DropDownPage": "DropDownPage",
    "/DropDownPage/DropDownPage1": {
      "label": "DropDownPage1",
      "describe": "This is a describe for DropDownPage1."
    }
  },
  "ui": {
    "menu": "Menu",
    "close": "Close",
    "language": "Language"
  }
}
```

### 使用方式
```typescript
// 在 script 中
const { $t } = useNuxtApp()
const title = $t('header.title')

// 在 template 中
{{ $t("pages.page1.heading") }}
```

## 註解規範

### 中文註解
- 使用**繁體中文**撰寫註解
- 註解說明關鍵邏輯和業務需求

```typescript
// 解析 JWT payload
const parseJwtPayload = (token: string) => {...}

// 檢查 token 是否已過期
const isTokenExpired = (token: string): boolean => {...}

// 每 5 分鐘檢查一次 token 是否過期
tokenExpiryInterval = setInterval(() => {...}, 5 * 60 * 1000)
```

## 錯誤處理

### Try-Catch 使用
```typescript
try {
  const response = await $fetch<AuthResponse>(url, options)
  // 處理成功邏輯
} catch (error) {
  console.error('Login failed:', error)
  // 處理錯誤邏輯
}
```

### Toast 通知
```typescript
const toast = useToast()

toast.add({
  color: "success",
  title: "操作成功",
  icon: "heroicons-check-circle-16-solid",
  description: "詳細說明",
  duration: 3000,
  ui: { icon: "!size-10" }
})
```

## 環境配置

### Runtime Config
```typescript
// nuxt.config.ts
runtimeConfig: {
  public: {
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    apiBaseUrl: process.env.API_BASE_URL || "http://localhost:5001"
  }
}

// 使用方式
const config = useRuntimeConfig()
const apiUrl = config.public.apiBaseUrl
```

## 總結

此 coding style 強調：
1. **一致性**: 統一的命名和結構規範
2. **可讀性**: 清晰的程式碼組織和中文註解
3. **型別安全**: 完整的 TypeScript 型別定義
4. **現代化**: 使用 Composition API 和最新的 Vue 3 特性
5. **國際化**: 完整的多語言支援架構

遵循此指南有助於維持程式碼品質和團隊協作效率。