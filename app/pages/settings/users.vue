<script setup lang="ts">
import type { DropdownMenuItem, TableColumn } from '@nuxt/ui'
import type { ChangeLogEventDtoPagedResult, UserListItemDto, UserListItemDtoPagedResult } from '~/utils/apiEndpoints'
import type { HistoryTimelineEntry } from '~/components/HistoryTimeline.vue'
import type { Column } from '@tanstack/vue-table'
import type { UserFormMode } from '~/components/user/Form.vue'

interface AppTableExposed {
  scrollToTop: () => void
}

interface UserFormExposed {
  isSubmitting: boolean
  reset: () => void
  submit: () => Promise<void>
}

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
const userStore = useUserStore()
const keyword = ref('')
const submittedKeyword = ref('')
const users = ref<UserListItemDto[]>([])
const currentPage = ref(0)
const totalCount = ref(0)
const isLoading = ref(false)
const isResetting = ref(false)
const hasLoaded = ref(false)
const loadError = ref<string | null>(null)
const isUserDrawerOpen = ref(false)
const userFormMode = ref<UserFormMode>('create')
const selectedUser = ref<UserListItemDto | null>(null)
const userForm = useTemplateRef<UserFormExposed>('userForm')
const userFormId = `admin-user-form-${useId()}`
const UButton = resolveComponent('UButton')
const columnPinning = ref({
  left: ['rowNumber', 'person'],
  right: ['actions']
})

const columns: TableColumn<UserListItemDto>[] = [
  {
    id: 'rowNumber',
    header: ({ column }) => getHeader(column, '#', 'left'),
    cell: ({ row }) => h('span', { class: 'block text-center tabular-nums' }, row.index + 1),
    size: 64
  },
  { 
    id: 'person',
    accessorKey: 'EmployeeName',
    header: ({column}) => getHeader(column, '人員', 'left'), 
  },
  { id: 'userName', accessorKey: 'UserName', header: '登入帳號' },
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

const table = useTemplateRef<AppTableExposed>('table')
const hasMore = computed(() => hasLoaded.value && users.value.length < totalCount.value)
const isUserSubmitting = computed(() => userForm.value?.isSubmitting ?? false)
const userDrawerTitle = computed(() => (
  userFormMode.value === 'create' ? '建立使用者' : '編輯使用者'
))
const userDrawerDescription = computed(() => (
  userFormMode.value === 'create'
    ? '建立使用者帳號並設定角色'
    : '更新使用者資料並調整角色'
))
const userSubmitLabel = computed(() => (
  userFormMode.value === 'create' ? '建立' : '更新'
))

const isUserHistorySlideoverOpen = ref(false)
const selectedHistoryUser = ref<UserListItemDto | null>(null)
const historyItems = ref<HistoryTimelineEntry[]>([])
const historyCurrentPage = ref(0)
const historyTotalCount = ref(0)
const historyHasLoaded = ref(false)
const isHistoryLoading = ref(false)
const historyLoadError = ref<string | null>(null)
const historySession = ref(0)
const historyScrollArea = useTemplateRef<{ $el: HTMLElement }>('historyScrollArea')
let historyController: AbortController | null = null
const historyHasMore = computed(() => historyHasLoaded.value && historyItems.value.length < historyTotalCount.value)
const historyUserId = computed(() => selectedHistoryUser.value?.Id?.trim() || '')
const historyDescription = computed(() => {
  const user = selectedHistoryUser.value
  return `查看 ${user?.EmployeeName || user?.UserName || '使用者'} 的異動歷程與修改前後內容`
})

useTableInfiniteScroll({
  target: () => historyScrollArea.value?.$el,
  enabled: () => isUserHistorySlideoverOpen.value && historyHasLoaded.value && !historyLoadError.value,
  loading: isHistoryLoading,
  hasMore: historyHasMore,
  onLoadMore: loadUserHistory
})

function invalidateHistoryRequest() {
  historySession.value += 1
  historyController?.abort()
  historyController = null
  isHistoryLoading.value = false
}

function handleViewUserHistory(user: UserListItemDto) {
  invalidateHistoryRequest()
  selectedHistoryUser.value = user
  historyItems.value = []
  historyCurrentPage.value = 0
  historyTotalCount.value = 0
  historyHasLoaded.value = false
  historyLoadError.value = null
  isUserHistorySlideoverOpen.value = true
  void loadUserHistory()
}

async function loadUserHistory() {
  if (!isUserHistorySlideoverOpen.value || isHistoryLoading.value || (historyHasLoaded.value && !historyHasMore.value)) {
    return
  }
  if (!historyUserId.value) {
    historyLoadError.value = '無法查詢：缺少使用者識別碼。'
    return
  }

  const session = historySession.value
  const controller = new AbortController()
  historyController = controller
  const pageToLoad = historyCurrentPage.value + 1
  isHistoryLoading.value = true
  historyLoadError.value = null

  try {
    const request = apiEndpoints.changeLog.findUserChangeLog(historyUserId.value, pageToLoad, pageSize)
    const result = await $api<ChangeLogEventDtoPagedResult>(request.path, {
      ...request.options,
      signal: controller.signal
    })
    if (session !== historySession.value || controller.signal.aborted) return

    const total = result?.TotalCount
    if (typeof total !== 'number' || !Number.isInteger(total) || total < 0) {
      throw new Error('異動紀錄分頁 API 未回傳有效的總筆數')
    }
    const items = result.Items ?? []
    if (!Array.isArray(items)) {
      throw new Error('異動紀錄分頁 API 回傳的資料格式不正確')
    }
    if (!items.length && historyItems.value.length < total) {
      throw new Error('異動紀錄分頁資料不一致，請重新載入。')
    }

    const offset = historyItems.value.length
    const entries: HistoryTimelineEntry[] = items.map((item, index) => ({
      id: `${session}-${offset + index}`,
      editorName: item.EditorName || '未知編輯者',
      editorAvatarUrl: item.EditorAvatarUrl || undefined,
      changeCount: item.RelatedTables?.length ?? 0,
      executeTime: item.ExecuteTime
    }))
    historyItems.value.push(...entries)
    historyCurrentPage.value = pageToLoad
    historyTotalCount.value = total
    historyHasLoaded.value = true
  } catch (error) {
    if (session !== historySession.value || controller.signal.aborted) return
    const normalizedError = normalizeApiError(error, '載入異動紀錄失敗，請稍後再試。')
    historyLoadError.value = normalizedError.message
  } finally {
    // A closed or replaced session must not clear its successor's loading state.
    if (session === historySession.value) {
      isHistoryLoading.value = false
      historyController = null
    }
  }
}

watch(isUserHistorySlideoverOpen, open => {
  if (!open) invalidateHistoryRequest()
}, { flush: 'sync' })

function handleHistoryAfterLeave() {
  if (!isUserHistorySlideoverOpen.value) selectedHistoryUser.value = null
}

onBeforeUnmount(invalidateHistoryRequest)

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

    const normalizedError = normalizeApiError(
      error,
      '載入使用者資料失敗，請稍後再試。'
    )

    if (normalizedError.statusCode === 401) {
      return
    }

    loadError.value = normalizedError.message

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

async function loadRoles() {
  try {
    await userStore.loadRoles()
  } catch (error) {
    console.error('[Users] Failed to load roles:', error)

    const normalizedError = normalizeApiError(error, '載入角色資料失敗，請稍後再試。')

    if (normalizedError.statusCode === 401) {
      return
    }

    toast.add({
      title: '載入角色失敗',
      description: normalizedError.message,
      icon: 'i-lucide-circle-x',
      color: 'error'
    })
  }
}

async function handleSearch() {
  submittedKeyword.value = keyword.value.trim()

  table.value?.scrollToTop()

  await loadUsers({ reset: true })
}

function handleAddUser() {
  selectedUser.value = null
  userFormMode.value = 'create'
  isUserDrawerOpen.value = true
}

function handleEditUser(user: UserListItemDto) {
  selectedUser.value = user
  userFormMode.value = 'edit'
  isUserDrawerOpen.value = true
}

function getUserActionItems(user: UserListItemDto): DropdownMenuItem[] {
  return [
    {
      label: '編輯使用者',
      icon: 'i-lucide-user-pen',
      onSelect: () => handleEditUser(user)
    },
    {
      label: '異動紀錄',
      icon: 'i-lucide-timeline',
      onSelect: () => handleViewUserHistory(user)
    }
  ]
}

function closeUserDrawer() {
  if (!isUserSubmitting.value) {
    isUserDrawerOpen.value = false
  }
}

async function submitUserForm() {
  await userForm.value?.submit()
}

async function handleUserSaved() {
  isUserDrawerOpen.value = false
  await loadUsers({ reset: true })
}

function handleUserDrawerAnimationEnd(open: boolean) {
  if (open) {
    return
  }

  userForm.value?.reset()
  selectedUser.value = null
  userFormMode.value = 'create'
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
  const rolesPromise = loadRoles()
  await loadUsers({ reset: true })
  await rolesPromise
})
</script>

<template>
  <AppTable
    ref="table"
    v-model:column-pinning="columnPinning"
    :data="users"
    :columns="columns"
    :loading="isLoading"
    :has-more="hasMore && !loadError"
    :total="hasLoaded ? totalCount : undefined"
    sticky
    infinite-scroll
    @load-more="loadUsers"
  >
    <template #header>
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
    </template>

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
              :key="role.RoleName || role.RoleDesc || index"
              :label="role.RoleDesc || role.RoleName || '—'"
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
          <UDropdownMenu
            :items="getUserActionItems(row.original)"
            :content="{ align: 'end' }"
          >
            <UButton
              icon="i-lucide-ellipsis-vertical"
              color="neutral"
              variant="ghost"
              size="md"
              aria-label="使用者操作"
            />
          </UDropdownMenu>
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
  </AppTable>

  <USlideover
    v-model:open="isUserHistorySlideoverOpen"
    side="right"
    title="異動紀錄"
    :description="historyDescription"
    :ui="{
      content: 'w-112 max-w-full overflow-hidden',
      header: 'shrink-0 px-6 py-5',
      wrapper: 'pr-8',
      body: 'flex min-h-0 overflow-hidden p-3 sm:p-3'
    }"
    @after:leave="handleHistoryAfterLeave"
  >
    <template #body>
      <UScrollArea
        :key="historySession"
        ref="historyScrollArea"
        class="h-full min-h-0 w-full"
        :ui="{ viewport: 'p-1' }"
      >
        <HistoryTimeline
          v-if="historyItems.length || (historyHasLoaded && !isHistoryLoading && !historyLoadError)"
          :items="historyItems"
        />
        <div v-if="isHistoryLoading" role="status" class="flex items-center justify-center gap-2 py-6 text-sm text-muted">
          <UIcon name="i-lucide-loader-circle" class="size-5 animate-spin" />
          {{ historyHasLoaded ? '載入更多異動紀錄…' : '載入異動紀錄中…' }}
        </div>
        <div v-else-if="historyLoadError" role="alert" class="flex flex-col items-center gap-3 py-6 text-center">
          <p class="text-sm text-error">{{ historyLoadError }}</p>
          <UButton
            v-if="historyUserId"
            label="重新載入"
            color="neutral"
            variant="outline"
            size="sm"
            @click="loadUserHistory"
          />
        </div>
        <p v-else-if="historyHasLoaded && historyItems.length && !historyHasMore" role="status" class="py-6 text-center text-sm text-muted">
          沒有更多資料
        </p>
      </UScrollArea>
    </template>
  </USlideover>

  <UDrawer
    v-model:open="isUserDrawerOpen"
    direction="right"
    inset
    :handle-only="true"
    :dismissible="!isUserSubmitting"
    :title="userDrawerTitle"
    :description="userDrawerDescription"
    :ui="{
      content: 'w-md!',
      container: 'h-full min-h-0 overflow-hidden',
      header: 'shrink-0',
      body: 'min-h-0 overflow-y-auto',
      footer: 'grid shrink-0 grid-cols-2 gap-2.5'
    }"
    @animation-end="handleUserDrawerAnimationEnd"
  >
    <template #body>
      <UserForm
        v-if="isUserDrawerOpen"
        :key="`${userFormMode}-${selectedUser?.Id ?? 'new'}`"
        ref="userForm"
        :mode="userFormMode"
        :selected-user="selectedUser"
        :form-id="userFormId"
        @saved="handleUserSaved"
      />
    </template>

    <template #footer>
      <UButton
        type="button"
        label="取消"
        color="neutral"
        variant="outline"
        block
        :disabled="isUserSubmitting"
        @click="closeUserDrawer"
      />
      <UButton
        type="button"
        :label="userSubmitLabel"
        color="neutral"
        block
        :loading="isUserSubmitting"
        :disabled="isUserSubmitting"
        @click="submitUserForm"
      />
    </template>
  </UDrawer>
</template>
