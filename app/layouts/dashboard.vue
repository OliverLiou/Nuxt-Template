<script setup lang="ts">
import { computed } from 'vue'
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()
const router = useRouter()

// 動態頁面標題
const pageTitle = computed(() => {
  return (route.meta.title as string) || '儀表板'
})

// 1. 定義虛擬父節點（無實體頁面，僅作折疊展開分類）
const virtualParents: NavigationMenuItem[] = [
  {
    parentId: 'system-settings', // 唯一識別符，供子節點 parent 屬性參考
    label: '系統設定',
    icon: 'i-lucide-settings',
    order: 2,
    children: []
  }
]

// 2. 側邊欄主要導航項目 (動態路由與虛擬節點合併計算)
const navigationItems = computed<NavigationMenuItem[]>(() => {
  const routes = router.getRoutes()

  // 映射實體根路由 (無 parent，且有 meta.title)
  const realRoots: NavigationMenuItem[] = routes.filter(r => !r.meta?.parentId && r.meta?.title)
    .map(r => ({
      label: r.meta?.title as string,
      icon: (r.meta?.icon as string) || 'i-lucide-circle',
      to: r.path,
      order: (r.meta?.order as number) || 99,
      children: []
    }))

  // 融合虛擬與實體的根選單
  const allRoots: NavigationMenuItem[] = [
    ...virtualParents.map(vp => ({ ...vp, children: [] })), // 深拷貝 children 陣列避免狀態共用
    ...realRoots
  ]

  // 將子節點分發到對應的父節點中 (不管是實體還是虛擬)
  routes.filter(r => r.meta?.parentId && r.meta?.title)
    .forEach(r => {
      // 根據子節點 meta.parentId 的名稱匹配根選單的 parentId
      const parent = allRoots.find(p => p.parentId === r.meta.parentId)
      
      if (parent) {
        parent.children = parent.children || []
        parent.children.push({
          label: r.meta?.title as string,
          icon: (r.meta?.icon as string) || 'i-lucide-circle',
          to: r.path,
          order: (r.meta?.order as number) || 99
        })
      }
    })

  // === 排序與清理流程 ===
  
  // 1. 先按照 Parent 的節點排序 (外層大分類)
  const sortedParents = allRoots.sort((a, b) => (a.order || 99) - (b.order || 99))

  // 2. 完成後，子節點 (sub navigationItems) 再進行排序與清理
  return sortedParents
    // 只保留「有子項目的虛擬節點」或「有連結的實體節點」
    .filter(parent => (parent.children && parent.children.length > 0) || parent.to)
    .map(parent => {
      if (parent.children && parent.children.length > 0) {
        // 子節點再排序一次
        parent.children.sort((a: any, b: any) => (a.order || 99) - (b.order || 99))
      } else {
        delete parent.children
      }
      return parent
    })
})

const userStore = useUserStore()
const showLogoutModal = ref(false)

function handleLogout() {
  userStore.logOut()
  navigateTo('/login')
}

// 使用者下拉選單項目 (個人資訊、登出)
const userMenuItems = [
  [
    {
      label: '個人資訊',
      icon: 'i-lucide-user',
      onSelect: () => {
        // alert('點擊了個人資訊')
      }
    }
  ],
  [
    {
      label: '登出',
      icon: 'i-lucide-log-out',
      color: 'error' as const,
      onSelect: () => {
        showLogoutModal.value = true
      }
    }
  ]
]
</script>

<template>
  <UDashboardGroup>
    <!-- 側邊欄 -->
    <UDashboardSidebar collapsible resizable :ui="{ header: 'border-b border-default', footer: 'border-t border-default' }">
      <!-- 側邊欄頂部 Header -->
      <template #header="{ collapsed }">
        <div class="flex flex-col gap-4 w-full">
          <UButton
            to="/"
            color="neutral"
            variant="ghost"
            icon="i-lucide-app-window-mac"
            :label="collapsed ? undefined : 'Dashboard'"
            size="xl"
            class="w-full justify-start px-2.5 py-2 font-semibold text-default"
            :class="[collapsed ? 'justify-center' : '']"
          />
        </div>
      </template>

      <!-- 側邊欄導航項目 -->
      <template #default="{ collapsed }">
        <UNavigationMenu
          :collapsed="collapsed"
          :items="navigationItems"
          orientation="vertical"
          class="w-full"
        />
      </template>

      <!-- 側邊欄底部 Footer -->
      <template #footer="{ collapsed }">
        <UDropdownMenu 
          :items="userMenuItems"
          :content="{ align: 'center', collisionPadding: 12 }"
        >
          <UButton
            :avatar="{
              src: userStore.user?.Picture || undefined,
              icon: 'i-lucide-user',
              size: 'sm'
            }"
            :label="collapsed ? undefined : (userStore.user?.EmployeeName || '使用者')"
            color="neutral"
            variant="ghost"
            block
            :trailing-icon="collapsed ? undefined : 'i-lucide-chevrons-up-down'"
            :square="collapsed"
          />
        </UDropdownMenu>
      </template>
    </UDashboardSidebar>

    <!-- 主面板 -->
    <UDashboardPanel>
      <!-- 全域頁首 Header -->
      <template #header>
        <UDashboardNavbar :title="pageTitle">
          <template #leading>
            <UDashboardSidebarCollapse />
          </template>
        </UDashboardNavbar>
      </template>

      <!-- 頁面主體內容 -->
      <template #body>
        <slot />
      </template>
    </UDashboardPanel>
  </UDashboardGroup>

  <BaseModal
    v-model:open="showLogoutModal"
    mode="confirm"
    title="登出確認"
    description="您確定要登出系統嗎？"
    @confirm="handleLogout"
  />
</template>
