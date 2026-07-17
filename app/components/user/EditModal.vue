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

const state = reactive<AdminUserUpdateForm>({
  EmployeeName: '',
  Email: '',
  PhoneNumber: '',
  IsActive: true,
  RoleNames: []
})

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
    PhoneNumber: state.PhoneNumber.trim()
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
  initialSnapshot.value = createSnapshot()
  form.value?.clear()
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
          class="space-y-4"
          @submit="onSubmit"
        >
          <UFormField name="EmployeeName" label="員工姓名" required>
            <UInput
              v-model="state.EmployeeName"
              class="w-full"
              autocomplete="name"
              placeholder="請輸入員工姓名"
            />
          </UFormField>

          <UFormField name="Email" label="Email" required>
            <UInput
              v-model="state.Email"
              class="w-full"
              type="email"
              autocomplete="email"
              placeholder="name@example.com"
            />
          </UFormField>

          <UFormField
            name="PhoneNumber"
            label="電話"
            hint="選填"
          >
            <UInput
              v-model="state.PhoneNumber"
              class="w-full"
              type="tel"
              autocomplete="tel"
              placeholder="請輸入電話號碼"
            />
          </UFormField>

          <template v-if="mode === 'admin'">
            <UFormField
              name="IsActive"
              label="帳號狀態"
              description="停用後，使用者將無法繼續使用系統。"
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
            >
              <USelectMenu
                v-model="state.RoleNames"
                :items="availableRoles"
                multiple
                class="w-full"
                placeholder="請選擇角色"
                :search-input="{ placeholder: '搜尋角色...' }"
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
