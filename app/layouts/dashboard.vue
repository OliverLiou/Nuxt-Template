<script setup lang="ts">
import { computed } from 'vue'

const route = useRoute()
const router = useRouter()

// 動態頁面標題
const pageTitle = computed(() => {
  return (route.meta.title as string) || '儀表板'
})

// 側邊欄主要導航項目 (無過濾，直接排序)
const navigationItems = computed(() => {
  return router.getRoutes()
    .map(r => ({
      label: (r.meta?.title as string) || (r.name as string) || r.path,
      icon: (r.meta?.icon as string) || 'i-lucide-circle',
      to: r.path,
      order: (r.meta?.order as number) || 99
    }))
    .sort((a, b) => a.order - b.order)
})

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
        // alert('點擊了登出')
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
            icon="i-lucide-terminal"
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
        <UDropdownMenu :items="userMenuItems" class="w-full">
          <UButton
            leading-icon="i-lucide-user"
            :label="collapsed ? undefined : 'Benjamin'"
            color="neutral"
            variant="ghost"
            class="w-full"
            :block="collapsed"
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
</template>
