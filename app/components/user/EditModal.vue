<script setup lang="ts">
import type { UpdateUserRequest, UserInfoDto } from '~/utils/apiEndpoints'
import {
  adminUserUpdateSchema,
  personalUserUpdateSchema,
  type AdminUserUpdateForm
} from '~/utils/userSchemas'

export type UserEditMode = 'personal' | 'admin'

const props = withDefaults(defineProps<{
  mode?: UserEditMode
  user?: UserInfoDto | null
  roleOptions?: string[]
}>(), {
  mode: 'personal',
  user: null,
  roleOptions: () => []
})

const emit = defineEmits<{
  updated: [userId: string]
}>()

const isOpen = defineModel<boolean>('open', { default: false })
const userStore = useUserStore()
const systemStore = useSystemStore()
const toast = useToast()
const { $api } = useNuxtApp()
const form = useTemplateRef('form')
const formId = `user-edit-form-${useId()}`
const isSubmitting = ref(false)
const initialSnapshot = ref('')

const state = reactive<AdminUserUpdateForm & { AvatarUrl: string | null }>({
  EmployeeName: '',
  Email: '',
  PhoneNumber: '',
  IsActive: true,
  RoleNames: [],
  AvatarUrl: null
})

const MAX_AVATAR_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_AVATAR_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp']
const isUploadingAvatar = ref(false)
const fileInput = useTemplateRef<HTMLInputElement>('fileInput')

const schema = computed(() => (
  props.mode === 'admin'
    ? adminUserUpdateSchema
    : personalUserUpdateSchema
))

const sourceUser = computed(() => (
  props.mode === 'personal'
    ? userStore.user
    : props.user
))

const modalTitle = computed(() => (
  props.mode === 'admin' ? '編輯使用者資料' : '編輯個人資訊'
))

const modalDescription = computed(() => (
  props.mode === 'admin'
    ? '修改使用者基本資料、啟用狀態與角色。'
    : '您只能修改自己的姓名、Email 與電話。'
))

const availableRoles = computed(() => normalizeRoles([
  ...props.roleOptions,
  ...(sourceUser.value?.RoleNames ?? [])
]))

const isDirty = computed(() => (
  initialSnapshot.value !== '' && createSnapshot() !== initialSnapshot.value
))

const isSubmitDisabled = computed(() => (
  !sourceUser.value?.Id || !isDirty.value || isSubmitting.value
))

function normalizeRoles(roles: string[]) {
  return [...new Set(
    roles
      .map(role => role.trim())
      .filter(Boolean)
  )].sort((left, right) => left.localeCompare(right))
}

function createSnapshot() {
  const personalFields = {
    EmployeeName: state.EmployeeName.trim(),
    Email: state.Email.trim(),
    PhoneNumber: state.PhoneNumber.trim(),
    AvatarUrl: state.AvatarUrl
  }

  if (props.mode === 'personal') {
    return JSON.stringify(personalFields)
  }

  return JSON.stringify({
    ...personalFields,
    IsActive: state.IsActive,
    RoleNames: normalizeRoles(state.RoleNames)
  })
}

function initializeForm() {
  const user = sourceUser.value

  state.EmployeeName = user?.EmployeeName ?? ''
  state.Email = user?.Email ?? ''
  state.PhoneNumber = user?.PhoneNumber ?? ''
  state.IsActive = user?.IsActive ?? true
  state.RoleNames = [...(user?.RoleNames ?? [])]
  state.AvatarUrl = user?.AvatarUrl ?? null
  initialSnapshot.value = createSnapshot()
  form.value?.clear()
}

async function handleAvatarChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  input.value = ''

  if (!file) return

  if (file.size > MAX_AVATAR_SIZE) {
    toast.add({
      title: '檔案過大',
      description: `大頭貼檔案大小不得超過 ${MAX_AVATAR_SIZE / 1024 / 1024} MB。`,
      color: 'error',
      icon: 'i-lucide-circle-x'
    })
    return
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (!ALLOWED_AVATAR_EXTENSIONS.includes(ext)) {
    toast.add({
      title: '不支援的檔案格式',
      description: `僅支援 ${ALLOWED_AVATAR_EXTENSIONS.join(', ')} 格式。`,
      color: 'error',
      icon: 'i-lucide-circle-x'
    })
    return
  }

  const userId = sourceUser.value?.Id
  if (!userId) return

  isUploadingAvatar.value = true

  try {
    const uploadRequest = apiEndpoints.user.uploadAvatar(userId, file)
    await $api<{ AvatarUrl: string }>(
      uploadRequest.path,
      uploadRequest.options
    )

    if (props.mode === 'personal') {
      // personal 模式：重新呼叫 UserProfile 取得後端已組好的完整 AvatarUrl
      const profileRequest = apiEndpoints.auth.getUserProfile()
      const refreshedUser = await $api<UserInfoDto>(
        profileRequest.path,
        profileRequest.options
      )
      state.AvatarUrl = refreshedUser.AvatarUrl ?? null
      userStore.setUser(refreshedUser)
    } else {
      // admin 模式：被編輯者非自己，UserProfile 取不到；交由父元件透過 updated 事件重新載入
      emit('updated', userId)
    }

    toast.add({
      title: '大頭貼已更新',
      description: '大頭貼已成功上傳並轉換為 WebP 格式。',
      color: 'success',
      icon: 'i-lucide-circle-check'
    })
  } catch (error) {
    console.error('上傳大頭貼失敗：', error)

    const apiError = normalizeApiError(error)

    if (apiError.statusCode === 401) {
      userStore.logOut()
      systemStore.openModal({
        title: '系統提示',
        description: '您的登入已逾期，請重新登入。',
        preventClose: true
      })
      await navigateTo('/login')
      return
    }

    toast.add({
      title: '上傳失敗',
      description: apiError.message,
      color: 'error',
      icon: 'i-lucide-circle-x'
    })
  } finally {
    isUploadingAvatar.value = false
  }
}

function closeModal() {
  if (!isSubmitting.value) {
    isOpen.value = false
  }
}

function createUpdateRequest(): UpdateUserRequest {
  const request: UpdateUserRequest = {
    EmployeeName: state.EmployeeName.trim(),
    Email: state.Email.trim(),
    PhoneNumber: state.PhoneNumber.trim() || null
  }

  if (props.mode === 'admin') {
    request.IsActive = state.IsActive
    request.RoleNames = normalizeRoles(state.RoleNames)
  }

  return request
}

async function onSubmit() {
  const userId = sourceUser.value?.Id

  if (!userId || !isDirty.value) {
    return
  }

  isSubmitting.value = true

  try {
    const updateRequest = apiEndpoints.user.updateUser(
      userId,
      createUpdateRequest()
    )
    await $api<unknown>(updateRequest.path, updateRequest.options)

    const profileRequest = apiEndpoints.auth.getUserProfile()
    const currentUser = await $api<UserInfoDto>(
      profileRequest.path,
      profileRequest.options
    )
    userStore.setUser(currentUser)

    emit('updated', userId)
    toast.add({
      title: '更新成功',
      description: '使用者資料已完成更新。',
      color: 'success',
      icon: 'i-lucide-circle-check'
    })
    isOpen.value = false
  } catch (error) {
    console.error('更新使用者資料失敗：', error)

    const apiError = normalizeApiError(error)

    if (apiError.statusCode === 401) {
      userStore.logOut()
      systemStore.openModal({
        title: '系統提示',
        description: '您的登入已逾期，請重新登入。',
        preventClose: true
      })
      await navigateTo('/login')
      return
    }

    toast.add({
      title: '更新失敗',
      description: apiError.message,
      color: 'error',
      icon: 'i-lucide-circle-x'
    })
  } finally {
    isSubmitting.value = false
  }
}

watch(
  [isOpen, sourceUser],
  ([open]) => {
    if (open && !isSubmitting.value) {
      initializeForm()
    }
  },
  { immediate: true }
)
</script>

<template>
  <UModal
    scrollable
    v-model:open="isOpen"
    :close="false"
    :dismissible="!isSubmitting"
    :ui="{
      content: 'bg-transparent divide-y-0 ring-0 shadow-none'
    }"
  >
    <template #content>
      <UCard class="w-full">
        <template #header>
          <div class="flex items-start justify-between gap-4">
            <div>
              <h2 class="text-highlighted font-semibold">
                {{ modalTitle }}
              </h2>
              <p class="mt-1 text-sm text-muted">
                {{ modalDescription }}
              </p>
            </div>

            <UButton
              icon="i-lucide-x"
              color="neutral"
              variant="ghost"
              aria-label="關閉"
              :disabled="isSubmitting"
              @click="closeModal"
            />
          </div>
        </template>

        <UForm
          :id="formId"
          ref="form"
          :schema="schema"
          :state="state"
          class="space-y-5"
          @submit="onSubmit"
        >
          <!-- 大頭貼預覽與上傳 -->
          <div class="flex flex-col items-center gap-3 rounded-2xl bg-elevated/50 p-5">
            <UAvatar
              :src="state.AvatarUrl || undefined"
              :alt="state.EmployeeName || '使用者'"
              icon="i-lucide-user"
              size="3xl"
              :ui="{ root: 'ring-2 ring-default ring-offset-2 ring-offset-elevated' }"
            />

            <div class="flex flex-col items-center gap-1">
              <UButton
                icon="i-lucide-upload"
                size="xs"
                color="neutral"
                variant="outline"
                label="選擇大頭貼"
                :loading="isUploadingAvatar"
                :disabled="isSubmitting || isUploadingAvatar"
                class="rounded-xl"
                @click="fileInput?.click()"
              />

              <p class="text-xs text-muted">
                支援 JPG / PNG / WebP，檔案大小 ≤ 2MB
              </p>
            </div>

            <input
              ref="fileInput"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              class="hidden"
              @change="handleAvatarChange"
            >
          </div>

          <UFormField name="EmployeeName" label="員工姓名" required class="rounded-xl">
            <UInput
              v-model="state.EmployeeName"
              class="w-full"
              autocomplete="name"
              placeholder="請輸入員工姓名"
              :ui="{ base: 'rounded-xl' }"
            />
          </UFormField>

          <UFormField name="Email" label="Email" required class="rounded-xl">
            <UInput
              v-model="state.Email"
              class="w-full"
              type="email"
              autocomplete="email"
              placeholder="name@example.com"
              :ui="{ base: 'rounded-xl' }"
            />
          </UFormField>

          <UFormField
            name="PhoneNumber"
            label="電話"
            hint="選填"
            class="rounded-xl"
          >
            <UInput
              v-model="state.PhoneNumber"
              class="w-full"
              type="tel"
              autocomplete="tel"
              placeholder="請輸入電話號碼"
              :ui="{ base: 'rounded-xl' }"
            />
          </UFormField>

          <template v-if="mode === 'admin'">
            <UFormField
              name="IsActive"
              label="帳號狀態"
              description="停用後，使用者將無法繼續使用系統。"
              class="rounded-xl"
            >
              <USwitch
                v-model="state.IsActive"
                label="啟用帳號"
              />
            </UFormField>

            <UFormField
              name="RoleNames"
              label="角色"
              description="可為使用者指派一個或多個角色。"
              class="rounded-xl"
            >
              <USelectMenu
                v-model="state.RoleNames"
                :items="availableRoles"
                multiple
                class="w-full"
                placeholder="請選擇角色"
                :search-input="{ placeholder: '搜尋角色...' }"
                :ui="{ base: 'rounded-xl' }"
              />
            </UFormField>
          </template>
        </UForm>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton
              label="取消"
              color="neutral"
              variant="outline"
              :disabled="isSubmitting"
              @click="closeModal"
            />
            <UButton
              type="submit"
              :form="formId"
              label="儲存"
              color="primary"
              :loading="isSubmitting"
              :disabled="isSubmitDisabled"
            />
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>
