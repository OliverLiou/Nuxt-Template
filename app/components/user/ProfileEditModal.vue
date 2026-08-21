<script setup lang="ts">
import type { UpdateMyProfileRequest, UserInfoDto } from '~/utils/apiEndpoints'
import { personalUserUpdateSchema, type PersonalUserUpdateForm } from '~/utils/userSchemas'

const isOpen = defineModel<boolean>('open', { default: false })
const userStore = useUserStore()
const toast = useToast()
const { $api } = useNuxtApp()
const form = useTemplateRef('form')
const formId = `user-edit-form-${useId()}`
const isSubmitting = ref(false)
const initialSnapshot = ref('')

const state = reactive<PersonalUserUpdateForm & { AvatarUrl: string | null }>({
  EmployeeName: '',
  PhoneNumber: '',
  AvatarUrl: null
})

const MAX_AVATAR_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_AVATAR_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp']
const isUploadingAvatar = ref(false)
const fileInput = useTemplateRef<HTMLInputElement>('fileInput')

const isDirty = computed(() => (
  initialSnapshot.value !== '' && createSnapshot() !== initialSnapshot.value
))

const isSubmitDisabled = computed(() => (
  !isDirty.value || isSubmitting.value
))

const roleDescs = computed(() => userStore.user?.RoleDescs ?? [])
const userEmail = computed(() => userStore.user?.Email ?? '')

function createSnapshot() {
  return JSON.stringify({
    EmployeeName: state.EmployeeName.trim(),
    PhoneNumber: state.PhoneNumber.trim(),
    AvatarUrl: state.AvatarUrl
  })
}

function initializeForm() {
  const user = userStore.user

  state.EmployeeName = user?.EmployeeName ?? ''
  state.PhoneNumber = user?.PhoneNumber ?? ''
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

  const userId = userStore.user?.Id
  if (!userId) return

  isUploadingAvatar.value = true

  try {
    const uploadRequest = apiEndpoints.user.uploadAvatar(userId, file)
    await $api<void>(
      uploadRequest.path,
      uploadRequest.options
    )

    // 重新呼叫 UserProfile 取得後端已組好的完整 AvatarUrl
    const profileRequest = apiEndpoints.user.getUserProfile()
    const refreshedUser = await $api<UserInfoDto>(
      profileRequest.path,
      profileRequest.options
    )
    state.AvatarUrl = refreshedUser.AvatarUrl ?? null
    userStore.setUser(refreshedUser)

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

function createUpdateRequest(): UpdateMyProfileRequest {
  return {
    EmployeeName: state.EmployeeName.trim(),
    PhoneNumber: state.PhoneNumber.trim() || null
  }
}

async function onSubmit() {
  if (!isDirty.value) {
    return
  }

  isSubmitting.value = true

  try {
    const updateRequest = apiEndpoints.user.updateMyProfile(createUpdateRequest())
    await $api<unknown>(updateRequest.path, updateRequest.options)

    const profileRequest = apiEndpoints.user.getUserProfile()
    const currentUser = await $api<UserInfoDto>(
      profileRequest.path,
      profileRequest.options
    )
    userStore.setUser(currentUser)

    toast.add({
      title: '更新成功',
      description: '個人資料已完成更新。',
      color: 'success',
      icon: 'i-lucide-circle-check'
    })
    isOpen.value = false
  } catch (error) {
    console.error('更新個人資料失敗：', error)

    const apiError = normalizeApiError(error)

    if (apiError.statusCode === 401) {
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
  isOpen,
  (open) => {
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
            <h2 class="text-highlighted font-semibold">
              編輯個人資訊
            </h2>

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

        <div class="space-y-5">
          <!-- 帳號資訊（唯讀） -->
          <div class="space-y-3 rounded-xl border border-muted bg-muted/50 p-4">
            <p class="text-xs font-medium text-toned">
              帳號資訊
            </p>

            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-mail" class="size-4 text-muted shrink-0" />
              <span class="text-sm text-muted shrink-0">Email</span>
              <span class="text-sm text-default truncate">
                {{ userEmail || '未提供' }}
              </span>
            </div>

            <div class="flex items-start gap-2">
              <UIcon name="i-lucide-shield" class="size-4 text-muted shrink-0 mt-0.5" />
              <span class="text-sm text-muted shrink-0 mt-0.5">角色清單</span>
              <div class="flex flex-wrap gap-1.5">
                <template v-if="roleDescs.length > 0">
                  <UBadge
                    v-for="role in roleDescs"
                    :key="role"
                    :label="role"
                    variant="solid"
                    color="neutral"
                    size="md"
                  />
                </template>
                <p v-else class="text-sm text-muted">
                  尚未指派角色
                </p>
              </div>
            </div>
          </div>

          <!-- 個人資訊（可編輯） -->
          <div class="space-y-4 rounded-xl bg-elevated/50 p-4 sm:p-5">
            <p class="text-xs font-medium text-toned">
              個人資訊
            </p>

            <div class="grid gap-5 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-6">
              <!-- 左：大頭貼預覽與上傳 -->
              <div class="flex flex-col gap-3 border-b border-muted pb-5 sm:border-r sm:border-b-0 sm:pr-6 sm:pb-0">

                <div class="flex flex-col items-center gap-3">
                  <UAvatar
                    :src="state.AvatarUrl || undefined"
                    :alt="state.EmployeeName || '使用者'"
                    icon="i-lucide-user"
                    size="3xl"
                    :ui="{ root: 'size-20 ring-2 ring-default ring-offset-2 ring-offset-elevated' }"
                  />

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

                  <p class="text-center text-xs leading-5 text-muted">
                    <span class="block">支援 JPG / PNG / WebP</span>
                    <span class="block">檔案大小 ≤ 5MB</span>
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

              <!-- 右：個人資訊表單 -->
              <UForm
                :id="formId"
                ref="form"
                :schema="personalUserUpdateSchema"
                :state="state"
                class="space-y-5"
                @submit="onSubmit"
              >
                <UFormField name="EmployeeName" label="姓名" required>
                  <UInput
                    v-model="state.EmployeeName"
                    class="w-full"
                    autocomplete="name"
                    placeholder="請輸入姓名"
                    :ui="{ base: 'rounded-xl' }"
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
                    :ui="{ base: 'rounded-xl' }"
                  />
                </UFormField>
              </UForm>
            </div>
          </div>
        </div>

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
