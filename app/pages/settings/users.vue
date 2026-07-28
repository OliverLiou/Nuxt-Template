<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { useInfiniteScroll } from '@vueuse/core'
import type { UserListItemDto, UserListItemDtoPagedResult } from '~/utils/apiEndpoints'
import type { Column } from '@tanstack/vue-table'

definePageMeta({
  parentId: 'system-settings', // 指定父節點為虛擬節點 "系統設定"
  layout: 'dashboard',
  title: '使用者管理',
  icon: 'i-lucide-users',
  order: 1
})

const pageSize = 10

const { $api } = useNuxtApp()
const toast = useToast()
const keyword = ref('')
const submittedKeyword = ref('')
const users = ref<UserListItemDto[]>([])
const currentPage = ref(0)
const totalCount = ref(0)
const isLoading = ref(false)
const isResetting = ref(false)
const hasLoaded = ref(false)
const loadError = ref<string | null>(null)
const UButton = resolveComponent('UButton')
const columnPinning = ref({
  left: ['person'],
  right: ['actions']
})

const columns: TableColumn<UserListItemDto>[] = [
  { 
    id: 'person',
    accessorKey: 'EmployeeName',
    header: ({column}) => getHeader(column, '人員', 'left'), 
  },
  { id: 'email', accessorKey: 'Email', header: 'Email' },
  { id: 'phone', accessorKey: 'PhoneNumber', header: '電話號碼' },
  { id: 'roles', accessorKey: 'Roles', header: '角色' },
  { id: 'status', accessorKey: 'IsActive', header: '帳號狀態' },
  { id: 'createdAt', accessorKey: 'CreatedAt', header: '建立時間' },
  { id: 'lastLoginAt', accessorKey: 'LastLoginAt', header: '最後登入時間' },
  { 
    id: 'actions',
    header: ({column}) => getHeader(column, '操作', 'right'),
  }
]

const table = useTemplateRef('table')
const hasMore = computed(() => hasLoaded.value && users.value.length < totalCount.value)

async function loadUsers(options: { reset?: boolean } = {}) {
  const reset = options.reset ?? false

  if (isLoading.value || (!reset && !hasMore.value)) {
    return
  }

  if (reset) {
    users.value = []
    currentPage.value = 0
    totalCount.value = 0
    hasLoaded.value = false
    isResetting.value = true
  }

  isLoading.value = true
  loadError.value = null

  try {
    const pageToLoad = reset ? 1 : currentPage.value + 1
    const querySearch = submittedKeyword.value.trim() || undefined
    const request = apiEndpoints.user.findUsers(pageToLoad, pageSize, querySearch)
    const result = await $api<UserListItemDtoPagedResult>(
      request.path,
      request.options
    )

    if (typeof result.TotalCount !== 'number') {
      throw new Error('使用者分頁 API 未回傳有效的總筆數')
    }

    const items = result.Items ?? []
    users.value = reset ? items : [...users.value, ...items]
    currentPage.value = pageToLoad
    totalCount.value = result.TotalCount
    hasLoaded.value = true
  } catch (error) {
    console.error('[Users] Failed to load users:', error)

    loadError.value = error instanceof Error
      ? error.message
      : '載入使用者資料失敗，請稍後再試。'

    toast.add({
      title: '載入使用者失敗',
      description: loadError.value,
      icon: 'i-lucide-circle-alert',
      color: 'error'
    })
  } finally {
    isLoading.value = false
    isResetting.value = false
  }
}

async function handleSearch() {
  submittedKeyword.value = keyword.value.trim()

  if (table.value?.$el instanceof HTMLElement) {
    table.value.$el.scrollTo({ top: 0 })
  }

  await loadUsers({ reset: true })
}

function handleAddUser() {
  toast.add({
    title: '新增使用者',
    description: '新增使用者功能尚未開放。',
    icon: 'i-lucide-user-round-plus',
    color: 'info'
  })
}

function handleEditUser(user: UserListItemDto) {
  toast.add({
    title: '編輯使用者',
    description: `已選取 ${user.EmployeeName || user.UserName || '使用者'}。`,
    icon: 'i-lucide-user-pen',
    color: 'info'
  })
}

function getHeader(column: Column<UserListItemDto>, label: string, position: 'left' | 'right') {
  const isPinned = column.getIsPinned()

  return h(UButton, {
    color: 'neutral',
    variant: 'ghost',
    label,
    icon: isPinned ? 'i-lucide-pin-off' : 'i-lucide-pin',
    class: '-mx-2.5 text-highlighted font-semibold',
    onClick() {
      column.pin(isPinned === position ? false : position)
    }
  })
}

onMounted(async () => {
  await loadUsers({ reset: true })

  const tableElement = table.value?.$el

  if (!(tableElement instanceof HTMLElement)) {
    console.error('[Users] Unable to initialize infinite scroll: table element not found')
    return
  }

  useInfiniteScroll(
    tableElement,
    () => loadUsers(),
    {
      distance: 200,
      canLoadMore: () => {
        return !isLoading.value && !loadError.value && hasMore.value
      }
    }
  )
})
</script>

<template>
  <div class="flex min-w-0 w-full flex-1 flex-col divide-y divide-accented overflow-hidden rounded-lg border border-default">
    <div class="flex items-center gap-2 overflow-x-auto px-3.5 py-2">
      <div class="flex min-w-0 flex-1 items-center gap-2">
        <UInput
          v-model="keyword"
          icon="i-lucide-search"
          placeholder="請輸入關鍵字.."
          class="max-w-sm min-w-[16ch]"
        />

        <UButton
          label="搜尋"
          :loading="isResetting"
          :disabled="isLoading"
          @click="handleSearch"
        />
      </div>

      <UTooltip text="新增使用者">
        <UButton
          type="button"
          icon="i-lucide-user-round-plus"
          color="neutral"
          variant="outline"
          @click="handleAddUser"
        />
      </UTooltip>
    </div>

    <div class="min-w-0 overflow-x-auto">
      <UTable
        ref="table"
        :data="users"
        :columns="columns"
        :loading="isLoading"
        sticky
        class="h-96"
        v-model:column-pinning="columnPinning"
        :ui="{
          th: 'whitespace-nowrap',
          td: 'h-10 truncate',
          separator: 'z-2',
        }"
      >
        <template #person-cell="{ row }">
          <div class="flex items-center gap-2.5">
            <UAvatar
              :src="row.original.AvatarUrl || undefined"
              :alt="row.original.EmployeeName || row.original.UserName || '使用者'"
              icon="i-lucide-user"
              size="md"
            />

            <span class="font-medium text-highlighted">
              {{ row.original.EmployeeName || row.original.UserName || '—' }}
            </span>
          </div>
        </template>

        <template #email-cell="{ row }">
          <span class="text-muted">{{ row.original.Email || '—' }}</span>
        </template>

        <template #phone-cell="{ row }">
          <span class="text-muted">{{ row.original.PhoneNumber || '—' }}</span>
        </template>

        <template #roles-cell="{ row }">
          <div class="flex gap-1.5">
            <UBadge
              v-for="(role, index) in row.original.Roles || []"
              :key="role.Id || role.RoleDesc || index"
              :label="role.RoleDesc || role.Id || '—'"
              color="info"
              variant="subtle"
              size="md"
            />
            <span v-if="!row.original.Roles?.length" class="text-muted">—</span>
          </div>
        </template>

        <template #status-cell="{ row }">
          <UBadge
            :label="row.original.IsActive ? '已啟用' : '已停用'"
            :color="row.original.IsActive ? 'primary' : 'warning'"
            :icon="row.original.IsActive ? 'lucide:square-check' : 'lucide:square-x'"
            variant="outline"
          />
        </template>

        <template #createdAt-cell="{ row }">
          <span class="text-muted">{{ formatDate(row.original.CreatedAt) || '—' }}</span>
        </template>

        <template #lastLoginAt-cell="{ row }">
          <span class="text-muted">{{ formatDate(row.original.LastLoginAt) || '—' }}</span>
        </template>

        <template #actions-cell="{ row }">
          <UTooltip text="編輯使用者">
            <UButton
              icon="i-lucide-user-pen"
              color="neutral"
              variant="subtle"
              size="md"
              @click="handleEditUser(row.original)"
            />
          </UTooltip>
        </template>

        <template #empty>
          <div
            v-if="loadError"
            class="flex flex-col items-center gap-3 py-12 text-center"
          >
            <UIcon name="i-lucide-circle-alert" class="size-8 text-error" />
            <p class="text-sm text-error">{{ loadError }}</p>
            <UButton
              label="重新載入"
              color="neutral"
              variant="outline"
              size="sm"
              :loading="isLoading"
              @click="loadUsers({ reset: true })"
            />
          </div>

          <div v-else class="flex flex-col items-center gap-2 py-12 text-center">
            <UIcon name="i-lucide-search-x" class="size-8 text-dimmed" />
            <p class="text-sm text-muted">找不到符合條件的使用者</p>
          </div>
        </template>
      </UTable>
    </div>
  </div>
</template>
