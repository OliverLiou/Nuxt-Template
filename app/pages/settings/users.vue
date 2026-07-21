<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { UserResponse, UserResponsePagedResult } from '~/utils/apiEndpoints'

definePageMeta({
  parentId: 'system-settings', // 指定父節點為虛擬節點 "系統設定"
  layout: 'dashboard',
  title: '使用者管理',
  icon: 'i-lucide-users',
  order: 1
})

type UserTableRow = UserResponse & {
  AvatarUrl?: string | null
  PhoneNumber?: string | null
  RoleNames?: string[] | null
  IsActive?: boolean
  CreatedAt?: string | null
}

const toast = useToast()
const keyword = ref('')
const submittedKeyword = ref('')

const mockUsers: UserTableRow[] = [
  {
    UserName: 'admin',
    EmployeeName: 'System Admin',
    Email: 'admin@example.com',
    PhoneNumber: null,
    AvatarUrl: null,
    RoleNames: ['系統管理員'],
    IsActive: true,
    CreatedAt: '2026-06-22 08:00:00+08',
    LastLoginAt: '2026-07-21 10:58:42.658017+08'
  },
  {
    UserName: 'oliver.liou',
    EmployeeName: 'Oliver Liou',
    Email: 'oliver.liou@example.com',
    PhoneNumber: '0912-345-678',
    AvatarUrl: null,
    RoleNames: ['管理者', '編輯者'],
    IsActive: true,
    CreatedAt: '2026-06-25 09:30:00+08',
    LastLoginAt: '2026-07-20 16:42:18+08'
  },
  {
    UserName: 'amy.chen',
    EmployeeName: 'Amy Chen',
    Email: 'amy.chen@example.com',
    PhoneNumber: '0988-765-432',
    AvatarUrl: null,
    RoleNames: ['一般使用者'],
    IsActive: false,
    CreatedAt: '2026-07-01 13:15:00+08',
    LastLoginAt: null
  }
]

const mockResult = {
  Items: mockUsers,
  TotalCount: mockUsers.length
} satisfies UserResponsePagedResult

const columns: TableColumn<UserTableRow>[] = [
  { id: 'person', accessorKey: 'EmployeeName', header: '人員' },
  { id: 'email', accessorKey: 'Email', header: 'Email' },
  { id: 'phone', accessorKey: 'PhoneNumber', header: '電話號碼' },
  { id: 'roles', accessorKey: 'RoleNames', header: '角色' },
  { id: 'status', accessorKey: 'IsActive', header: '帳號狀態' },
  { id: 'createdAt', accessorKey: 'CreatedAt', header: '建立時間' },
  { id: 'lastLoginAt', accessorKey: 'LastLoginAt', header: '最後登入時間' },
  { id: 'actions', header: '操作' }
]

const filteredUsers = computed(() => {
  const normalizedKeyword = submittedKeyword.value.trim().toLocaleLowerCase()

  if (!normalizedKeyword) {
    return mockResult.Items
  }

  return mockResult.Items.filter(user => {
    return [user.UserName, user.EmployeeName, user.Email].some(value =>
      value?.toLocaleLowerCase().includes(normalizedKeyword)
    )
  })
})

function handleSearch() {
  submittedKeyword.value = keyword.value
}

function handleAddUser() {
  toast.add({
    title: '新增使用者',
    description: '新增使用者功能尚未開放。',
    icon: 'i-lucide-user-round-plus',
    color: 'info'
  })
}

function handleEditUser(user: UserTableRow) {
  toast.add({
    title: '編輯使用者',
    description: `已選取 ${user.EmployeeName || user.UserName || '使用者'}。`,
    icon: 'i-lucide-user-pen',
    color: 'info'
  })
}
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

        <UButton type="submit" label="搜尋" />
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
        :data="filteredUsers"
        :columns="columns"
        class="min-w-max"
        :ui="{
          th: 'whitespace-nowrap text-center',
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
          <div class="flex justify-center">
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
          <div class="flex flex-col items-center gap-2 py-12 text-center">
            <UIcon name="i-lucide-search-x" class="size-8 text-dimmed" />
            <p class="text-sm text-muted">找不到符合條件的使用者</p>
          </div>
        </template>
      </UTable>
    </div>
  </div>
</template>
