<script setup lang="ts">
import type {
  AdminCreateUserRequest,
  AdminUpdateUserRequest,
  UserListItemDto
} from '~/utils/apiEndpoints'
import {
  adminUserCreateSchema,
  adminUserEditSchema,
  type AdminUserForm
} from '~/utils/userSchemas'

export type UserFormMode = 'create' | 'edit'

const props = defineProps<{
  mode: UserFormMode
  selectedUser?: UserListItemDto | null
  formId: string
}>()

const emit = defineEmits<{
  saved: []
}>()

interface RoleOption {
  label: string
  value: string
}

const { $api } = useNuxtApp()
const toast = useToast()
const userStore = useUserStore()
const form = useTemplateRef('form')
const isSubmitting = ref(false)
const apiError = ref<string | null>(null)

const state = reactive<AdminUserForm>({
  UserName: '',
  EmployeeName: '',
  Email: '',
  Password: '',
  PasswordConfirm: '',
  PhoneNumber: '',
  IsActive: false,
  Roles: []
})

const schema = computed(() => (
  props.mode === 'create'
    ? adminUserCreateSchema
    : adminUserEditSchema
))

const roleOptions = computed<RoleOption[]>(() => {
  const roles = new Map<string, RoleOption>()

  for (const role of userStore.roles) {
    if (!role.RoleName) {
      continue
    }

    const label = role.RoleDesc?.trim() || role.RoleName
    roles.set(role.RoleName, {
      label,
      value: role.RoleName
    })
  }

  return [...roles.values()]
})

function initializeForm() {
  const user = props.mode === 'edit' ? props.selectedUser : null

  state.UserName = ''
  state.EmployeeName = user?.EmployeeName ?? ''
  state.Email = user?.Email ?? ''
  state.Password = ''
  state.PasswordConfirm = ''
  state.PhoneNumber = user?.PhoneNumber ?? ''
  state.IsActive = user?.IsActive ?? false
  state.Roles = user?.Roles
    ?.map(role => role.RoleName)
    .filter(roleName => Boolean(roleName))
    ?? []

  apiError.value = null
  nextTick(() => form.value?.clear())
}

function reset() {
  initializeForm()
  isSubmitting.value = false
}

function createCreateRequest(): AdminCreateUserRequest {
  return {
    UserName: state.UserName.trim(),
    EmployeeName: state.EmployeeName.trim(),
    Email: state.Email.trim() || null,
    Password: state.Password,
    PasswordConfirm: state.PasswordConfirm,
    PhoneNumber: state.PhoneNumber.trim() || null,
    IsActive: state.IsActive,
    Roles: [...state.Roles]
  }
}

function createUpdateRequest(): AdminUpdateUserRequest {
  return {
    EmployeeName: state.EmployeeName.trim(),
    Email: state.Email.trim() || null,
    PhoneNumber: state.PhoneNumber.trim() || null,
    IsActive: state.IsActive,
    Roles: [...state.Roles]
  }
}

async function onSubmit() {
  if (isSubmitting.value) {
    return
  }

  if (props.mode === 'create') {
    isSubmitting.value = true
    apiError.value = null
    let saved = false

    try {
      const request = apiEndpoints.user.createUserByAdmin(createCreateRequest())
      await $api<unknown>(request.path, request.options)

      toast.add({
        title: '建立成功',
        description: '使用者帳號已完成建立。',
        icon: 'i-lucide-circle-check',
        color: 'success'
      })
      saved = true
    } catch (error) {
      console.error('[UserForm] Failed to create user:', error)

      const normalizedError = normalizeApiError(error, '建立使用者失敗，請稍後再試。')

      if (normalizedError.statusCode === 401) {
        return
      }

      apiError.value = normalizedError.message
      toast.add({
        title: '建立失敗',
        description: normalizedError.message,
        icon: 'i-lucide-circle-x',
        color: 'error'
      })
    } finally {
      isSubmitting.value = false
    }

    if (saved) {
      emit('saved')
    }

    return
  }

  const userId = props.selectedUser?.Id

  if (!userId) {
    apiError.value = '找不到要更新的使用者識別碼。'
    toast.add({
      title: '更新失敗',
      description: apiError.value,
      icon: 'i-lucide-circle-x',
      color: 'error'
    })
    return
  }

  isSubmitting.value = true
  apiError.value = null
  let saved = false

  try {
    const request = apiEndpoints.user.updateUserByAdmin(
      userId,
      createUpdateRequest()
    )
    await $api<unknown>(request.path, request.options)

    toast.add({
      title: '更新成功',
      description: '使用者資料已完成更新。',
      icon: 'i-lucide-circle-check',
      color: 'success'
    })
    saved = true
  } catch (error) {
    console.error('[UserForm] Failed to update user:', error)

    const normalizedError = normalizeApiError(error, '更新使用者資料失敗，請稍後再試。')

    if (normalizedError.statusCode === 401) {
      return
    }

    apiError.value = normalizedError.message
    toast.add({
      title: '更新失敗',
      description: normalizedError.message,
      icon: 'i-lucide-circle-x',
      color: 'error'
    })
  } finally {
    isSubmitting.value = false
  }

  if (saved) {
    emit('saved')
  }
}

async function submit() {
  if (isSubmitting.value) {
    return
  }

  await form.value?.submit()
}

watch(
  () => [props.mode, props.selectedUser] as const,
  () => {
    initializeForm()
  },
  { immediate: true }
)

defineExpose({
  isSubmitting,
  reset,
  submit
})
</script>

<template>
  <div class="w-100.75 max-w-full p-2.5">
    <UAlert
      v-if="apiError"
      title="無法完成使用者操作"
      :description="apiError"
      icon="i-lucide-circle-alert"
      color="error"
      variant="subtle"
      class="mb-4"
    />

    <UForm
      :id="formId"
      ref="form"
      :schema="schema"
      :state="state"
      :disabled="isSubmitting"
      class="space-y-4"
      @submit="onSubmit"
    >
      <UFormField
        v-if="mode === 'create'"
        name="UserName"
        label="帳號名稱"
        description="請輸入 4–50 個字元"
        required
        orientation="horizontal"
        class="grid grid-cols-2 items-start gap-2.5"
        :ui="{ container: 'mt-0 min-w-0' }"
      >
        <UInput
          v-model="state.UserName"
          autocomplete="username"
          minlength="4"
          maxlength="50"
          class="w-full"
        />
      </UFormField>

      <UFormField
        name="EmployeeName"
        label="姓名"
        description="請輸入完整名稱"
        required
        orientation="horizontal"
        class="grid grid-cols-2 items-start gap-2.5"
        :ui="{ container: 'mt-0 min-w-0' }"
      >
        <UInput
          v-model="state.EmployeeName"
          autocomplete="name"
          class="w-full"
        />
      </UFormField>

      <UFormField
        name="Email"
        label="Email"
        description="請輸入電子信箱"
        required
        orientation="horizontal"
        class="grid grid-cols-2 items-start gap-2.5"
        :ui="{ container: 'mt-0 min-w-0' }"
      >
        <UInput
          v-model="state.Email"
          type="email"
          autocomplete="email"
          class="w-full"
        />
      </UFormField>

      <template v-if="mode === 'create'">
        <UFormField
          name="Password"
          label="密碼"
          description="請輸入 8–20 位數（包含大小寫字母與數字）"
          required
          orientation="horizontal"
          class="grid grid-cols-2 items-start gap-2.5"
          :ui="{ container: 'mt-0 min-w-0' }"
        >
          <UInput
            v-model="state.Password"
            type="password"
            autocomplete="new-password"
            class="w-full"
          />
        </UFormField>

        <UFormField
          name="PasswordConfirm"
          label="確認密碼"
          description="請輸入與上方相同的密碼"
          required
          orientation="horizontal"
          class="grid grid-cols-2 items-start gap-2.5"
          :ui="{ container: 'mt-0 min-w-0' }"
        >
          <UInput
            v-model="state.PasswordConfirm"
            type="password"
            autocomplete="new-password"
            class="w-full"
          />
        </UFormField>
      </template>

      <UFormField
        name="PhoneNumber"
        label="電話號碼"
        description="請輸入電話號碼"
        orientation="horizontal"
        class="grid grid-cols-2 items-start gap-2.5"
        :ui="{ container: 'mt-0 min-w-0' }"
      >
        <UInput
          v-model="state.PhoneNumber"
          type="tel"
          autocomplete="tel"
          class="w-full"
        />
      </UFormField>

      <UFormField
        name="IsActive"
        label="帳號狀態"
        description="帳號是否啟用"
        required
        orientation="horizontal"
        class="grid grid-cols-2 items-start gap-2.5"
        :ui="{ container: 'mt-0 flex h-8 items-start' }"
      >
        <USwitch
          v-model="state.IsActive"
          aria-label="帳號是否啟用"
        />
      </UFormField>

      <UFormField
        name="Roles"
        label="角色"
        description="系統角色"
        orientation="horizontal"
        class="grid grid-cols-2 items-start gap-2.5"
        :ui="{ container: 'mt-0 min-w-0 w-full' }"
      >
        <div class="w-full min-w-0">
          <UCheckboxGroup
            v-model="state.Roles"
            :items="roleOptions"
            value-key="value"
            label-key="label"
            orientation="vertical"
            :disabled="isSubmitting"
          />
        </div>
      </UFormField>
    </UForm>
  </div>
</template>
