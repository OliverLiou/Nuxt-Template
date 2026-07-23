<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { useInfiniteScroll } from '@vueuse/core'
import type { UserInfoDto, UserResponsePagedResult } from '~/utils/apiEndpoints'

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
const users = ref<UserInfoDto[]>([])
const currentPage = ref(0)
const totalCount = ref(0)
const isLoading = ref(false)
const isResetting = ref(false)
const hasLoaded = ref(false)
const loadError = ref<string | null>(null)

const columns: TableColumn<UserInfoDto>[] = [
  { id: 'person', accessorKey: 'EmployeeName', header: '人員' },
  { id: 'email', accessorKey: 'Email', header: 'Email' },
  { id: 'phone', accessorKey: 'PhoneNumber', header: '電話號碼' },
  { id: 'roles', accessorKey: 'RoleNames', header: '角色' },
  { id: 'status', accessorKey: 'IsActive', header: '帳號狀態' },
  { id: 'createdAt', accessorKey: 'CreatedAt', header: '建立時間' },
  { id: 'lastLoginAt', accessorKey: 'LastLoginAt', header: '最後登入時間' },
  { id: 'actions', header: '操作' }
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
    const result = await $api<UserResponsePagedResult>(
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

function handleEditUser(user: UserInfoDto) {
  toast.add({
    title: '編輯使用者',
    description: `已選取 ${user.EmployeeName || user.UserName || '使用者'}。`,
    icon: 'i-lucide-user-pen',
    color: 'info'
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
  <div class="flex min-w-0 flex-col gap-2">
    <form class="flex flex-col gap-2 px-1 sm:flex-row sm:items-center" @submit.prevent="handleSearch">
      <div class="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        <UInput
          v-model="keyword"
          icon="i-lucide-search"
          placeholder="請輸入帳號、姓名、Email"
          class="w-full sm:max-w-sm"
        />

        <UButton
          type="submit"
          label="搜尋"
          :loading="isResetting"
          :disabled="isLoading"
        />
      </div>

      <UTooltip text="新增使用者">
        <UButton
          type="button"
          icon="i-lucide-user-round-plus"
          color="neutral"
          variant="outline"
          aria-label="新增使用者"
          @click="handleAddUser"
        />
      </UTooltip>
    </form>

    <div class="min-w-0 overflow-x-auto rounded-lg border border-default bg-default">
      <UTable
        ref="table"
        :data="users"
        :columns="columns"
        :loading="isLoading"
        sticky
        class="h-80 min-w-max sm:h-96 lg:h-[32rem]"
        :ui="{
          th: 'whitespace-nowrap',
          td: 'h-15 whitespace-nowrap'
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
          <div class="flex items-center gap-1.5">
            <UBadge
              v-for="role in row.original.RoleNames || []"
              :key="role"
              :label="role"
              color="info"
              variant="subtle"
              size="md"
            />
            <span v-if="!row.original.RoleNames?.length" class="text-muted">—</span>
          </div>
        </template>

        <template #status-cell="{ row }">
          <div class="flex">
            <UCheckbox
              :model-value="row.original.IsActive"
              :aria-label="row.original.IsActive ? '帳號已啟用' : '帳號未啟用'"
              disabled
            />
          </div>
        </template>

        <template #createdAt-cell="{ row }">
          <span class="text-muted">{{ row.original.CreatedAt || '—' }}</span>
        </template>

        <template #lastLoginAt-cell="{ row }">
          <span class="text-muted">{{ row.original.LastLoginAt || '—' }}</span>
        </template>

        <template #actions-cell="{ row }">
          <UTooltip text="編輯使用者">
            <UButton
              icon="i-lucide-user-pen"
              color="neutral"
              variant="outline"
              size="sm"
              aria-label="編輯使用者"
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

      <div
        v-if="loadError && users.length"
        class="flex items-center justify-center gap-2 border-t border-default px-4 py-2 text-sm text-error"
      >
        <span>{{ loadError }}</span>
        <UButton
          label="重試"
          color="neutral"
          variant="outline"
          size="xs"
          :loading="isLoading"
          @click="loadUsers()"
        />
      </div>
    </div>
  </div>
</template>
