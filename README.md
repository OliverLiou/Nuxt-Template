# 🚀 Nuxt Template

> 一個功能完整的 Nuxt 4 專案模板，整合 Google OAuth 登入、國際化、Nuxt UI 元件庫和現代化開發工具鏈

[![Nuxt](https://img.shields.io/badge/Nuxt-4.0.3-00DC82?style=flat&logo=nuxt.js&logoColor=white)](https://nuxt.com)
[![Vue](https://img.shields.io/badge/Vue-3.5.18-4FC08D?style=flat&logo=vue.js&logoColor=white)](https://vuejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.12-06B6D4?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Node.js](https://img.shields.io/badge/Node.js-22.13.0-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org)

---

## ✨ 功能特性

- 🔐 **Google OAuth 登入** - 整合 Google Identity Services，支援一鍵登入
- 🌍 **國際化支援** - 內建中英文語系切換（可擴展）
- 🎨 **Nuxt UI 4.0** - 54+ 高品質 Vue 元件，開箱即用
- 💾 **Pinia 狀態管理** - 使用 Composition API 風格的現代化狀態管理
- 🎯 **TypeScript** - 完整的型別支援和自動補全
- 🌈 **Tailwind CSS v4** - 最新版本的 Utility-First CSS 框架
- 📱 **響應式設計** - 完美支援行動裝置、平板和桌面
- 🔄 **自動導入** - Vue、Nuxt composables、元件自動導入
- 🚢 **Railway 部署** - 一鍵部署至 Railway 平台
- 📝 **完整文檔** - 詳細的編碼規範和元件使用指南

---

## 🛠️ 技術棧

| 類別 | 技術 | 版本 | 說明 |
|------|------|------|------|
| **框架** | Nuxt | 4.0.3 | Vue.js 的全端框架 |
| **前端** | Vue | 3.5.18 | 漸進式 JavaScript 框架 |
| **UI 庫** | Nuxt UI | 4.0.1 | 基於 Tailwind CSS 的 Vue 元件庫 |
| **樣式** | Tailwind CSS | 4.1.12 | Utility-First CSS 框架 |
| **狀態管理** | Pinia | 3.0.3 | Vue 的直覺式狀態管理庫 |
| **國際化** | @nuxtjs/i18n | 10.0.5 | Nuxt 的 i18n 整合模組 |
| **圖示** | @nuxt/icon | 2.0.0 | 整合 Iconify 的圖示系統 |
| **日期處理** | Moment.js | 2.30.1 | JavaScript 日期處理函式庫 |
| **語言** | TypeScript | 5.x | JavaScript 的超集，提供靜態型別 |

---

## 📋 環境需求

- **Node.js**: `22.13.0`
- **npm**: `11.6.0`

---

## 🚀 快速開始

### 1. 克隆專案

```bash
git clone <repository-url>
cd Nuxt-Template
```

### 2. 環境變數設定

複製 `.env.example` 並重新命名為 `.env`：

```bash
cp .env.example .env
```

編輯 `.env` 檔案，填入必要的環境變數：

```env
# Google OAuth Client ID
GOOGLE_CLIENT_ID=your_google_client_id_here

# API Base URL
API_BASE_URL=http://localhost:5001

# API Secret (僅 server 端使用)
API_SECRET=your_secret_key_here
```

> 💡 **提示**: 如何取得 Google Client ID？
> 前往 [Google Cloud Console](https://console.cloud.google.com/) → API 和服務 → 憑證 → 建立 OAuth 2.0 用戶端 ID

### 3. 安裝依賴

```bash
npm install
```

### 4. 啟動開發伺服器

```bash
npm run dev
```

開啟瀏覽器訪問 [http://localhost:3000](http://localhost:3000) 🎉

---

## 📁 專案結構

```
Nuxt-Template/
├── 📂 .claude/                    # Claude AI 相關配置
│   ├── ConventionalCommits.md    # Git commit 規範
│   └── 3.components/              # Nuxt UI 元件文檔
├── 📂 app/                        # 應用程式主目錄
│   ├── 📂 components/             # Vue 元件（自動導入）
│   │   ├── Header.vue
│   │   └── Footer.vue
│   ├── 📂 composables/            # Composables（自動導入）
│   ├── 📂 pages/                  # 頁面路由（檔案系統路由）
│   │   ├── index.vue
│   │   ├── Page1/
│   │   └── DropDownPage/
│   ├── 📂 stores/                 # Pinia 狀態管理
│   │   ├── auth.ts               # 認證 store
│   │   ├── googleAuth.ts         # Google 登入 store
│   │   └── ui.ts                 # UI 狀態 store
│   ├── 📂 middleware/             # 路由中介軟體
│   │   └── auth.ts               # 認證中介軟體
│   ├── 📂 plugins/                # Nuxt 插件
│   │   ├── main.ts               # Moment.js 插件
│   │   └── api.client.ts         # API 攔截器
│   ├── 📂 assets/                 # 靜態資源（CSS、圖片）
│   │   └── css/main.css
│   └── app.vue                    # 根元件
├── 📂 server/                     # Server 端程式碼
│   ├── api/                       # API 端點
│   ├── middleware/                # Server 中介軟體
│   └── utils/                     # Server 工具函數
├── 📂 i18n/                       # 國際化資源
│   └── locales/                   # 語系檔案
│       ├── en.json               # 英文
│       └── zh_TW.json            # 繁體中文
├── 📂 public/                     # 公開靜態資源
├── 📄 nuxt.config.ts              # Nuxt 配置檔
├── 📄 app.config.ts               # App 配置檔（UI 主題等）
├── 📄 tsconfig.json               # TypeScript 配置
├── 📄 package.json                # 專案依賴和腳本
├── 📄 .env                        # 環境變數（不提交至 Git）
├── 📄 .env.example                # 環境變數範本
├── 📄 CODING_STYLE.md             # 編碼風格規範
├── 📄 NuxtUI_Components.md        # Nuxt UI 元件使用指南
├── 📄 RAILWAY_DEPLOYMENT.md       # Railway 部署指南
└── 📄 README.md                   # 專案說明文件
```

---

## 💻 開發指南

### 常用指令

```bash
# 開發模式
npm run dev

# 建置生產版本
npm run build

# 預覽生產版本
npm run preview

# 生成靜態網站
npm run generate

# 啟動生產伺服器
npm start
```

### 編碼規範

本專案遵循嚴格的編碼規範，詳見 **[CODING_STYLE.md](./CODING_STYLE.md)**

**重點規範**：
- ✅ 使用 **單引號** (`'`) 而非雙引號
- ✅ **不使用分號** 結尾
- ✅ `<script setup>` 必須加上 `lang="ts"`
- ✅ 使用 **Composition API** 風格
- ✅ 註解使用 **繁體中文**
- ✅ 優先使用 **Nuxt UI 元件**

### 元件開發

使用 Nuxt UI 元件時，請參考 **[NuxtUI_Components.md](./NuxtUI_Components.md)**

**開發流程**：
1. 📋 查找 `.claude/3.components/` 目錄中的元件文檔
2. 🎨 使用現有元件，透過 `props`、`slots`、`ui` prop 自定義
3. ⚠️ 僅在必要時才建立自訂元件

**範例**：
```vue
<template>
  <!-- ✅ 使用 Nuxt UI 元件 -->
  <UButton
    color="primary"
    icon="i-lucide-plus"
    @click="handleAdd"
  >
    新增項目
  </UButton>

  <!-- ✅ 透過 ui prop 自定義 -->
  <UInput
    v-model="email"
    :ui="{ base: 'custom-class' }"
  />
</template>
```

### 路由和頁面

Nuxt 使用 **檔案系統路由**，在 `app/pages/` 下建立檔案即可自動生成路由：

```
app/pages/
├── index.vue              → /
├── Page1/
│   └── index.vue          → /Page1
└── DropDownPage/
    ├── index.vue          → /DropDownPage
    ├── DropDownPage1/
    │   └── index.vue      → /DropDownPage/DropDownPage1
    └── DropDownPage2/
        └── index.vue      → /DropDownPage/DropDownPage2
```

### 狀態管理

使用 Pinia 進行狀態管理，遵循 **Composition API** 風格：

```typescript
// stores/example.ts
export const useExampleStore = defineStore('example', () => {
  // 1. 狀態定義
  const count = ref(0)

  // 2. 計算屬性（Getters）
  const doubleCount = computed(() => count.value * 2)

  // 3. 方法定義（Actions）
  const increment = () => {
    count.value++
  }

  return {
    count,
    doubleCount,
    increment
  }
})
```

### 國際化

切換語言：
```vue
<script setup lang="ts">
const { locale, setLocale } = useI18n()

const switchToEnglish = () => {
  setLocale('en')
}
</script>

<template>
  <div>
    <p>{{ $t('pages.home.title') }}</p>
    <UButton @click="switchToEnglish">Switch to English</UButton>
  </div>
</template>
```

---

## 🚢 部署

### Railway 部署

本專案已配置 Railway 部署支援，詳細步驟請參考 **[RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md)**

**快速部署**：
1. 推送程式碼至 GitHub
2. 在 Railway 中連接 GitHub 儲存庫
3. 配置環境變數
4. 自動部署完成 🎉

### 手動建置

```bash
# 建置生產版本
npm run build

# 啟動生產伺服器
npm start
```

建置後的檔案會輸出至 `.output/` 目錄。

---

## 📚 文檔資源

### 內部文檔
- 📘 [編碼風格規範](./CODING_STYLE.md) - 詳細的程式碼風格指南
- 📗 [Nuxt UI 元件指南](./NuxtUI_Components.md) - 元件使用最佳實踐
- 📙 [Railway 部署指南](./RAILWAY_DEPLOYMENT.md) - 雲端部署完整教學

### 官方文檔
- [Nuxt 4 文檔](https://nuxt.com/docs)
- [Nuxt UI 文檔](https://ui.nuxt.com)
- [Vue 3 文檔](https://vuejs.org)
- [Pinia 文檔](https://pinia.vuejs.org)
- [Tailwind CSS 文檔](https://tailwindcss.com)
- [Nuxt i18n 文檔](https://i18n.nuxtjs.org)

### 圖示資源
- [Iconify](https://icon-sets.iconify.design/) - 探索所有可用圖示
- [Lucide Icons](https://lucide.dev/) - 美觀的圖示集
- [Heroicons](https://heroicons.com/) - Tailwind 團隊製作的圖示

---

## 🤝 貢獻

歡迎提交 Issue 或 Pull Request！

在貢獻前，請確保：
- ✅ 遵循 [CODING_STYLE.md](./CODING_STYLE.md) 規範
- ✅ 使用 [Conventional Commits](./.claude/ConventionalCommits.md) 格式撰寫 commit 訊息
- ✅ 在提交前測試你的程式碼

---

## 📄 授權

此專案採用 MIT 授權 - 詳見 [LICENSE](./LICENSE) 檔案

---

## 🙏 致謝

感謝以下開源專案：
- [Nuxt](https://nuxt.com)
- [Vue.js](https://vuejs.org)
- [Nuxt UI](https://ui.nuxt.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Pinia](https://pinia.vuejs.org)

---

<div align="center">

**⭐ 如果這個專案對你有幫助，請給它一個星星！**

Made with ❤️ using Nuxt 4

</div>
