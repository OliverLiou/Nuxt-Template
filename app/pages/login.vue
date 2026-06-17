<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

// 1. 定義登入表單的欄位結構
const fields = [
  {
    name: 'UserName',
    label: 'AD 帳號',
    type: 'text',
    placeholder: '請輸入企業 AD 帳號',
    required: true,
    defaultValue: ''
  },
  {
    name: 'Password',
    label: '密碼',
    type: 'password',
    placeholder: '請輸入密碼',
    required: true,
    defaultValue: ''
  }
]

// 2. 定義驗證 Schema
const schema = z.object({
  UserName: z.string().min(1, '請輸入 AD 帳號'),
  Password: z.string().min(1, '請輸入密碼')
})

type Schema = z.output<typeof schema>

// 3. 狀態控制與雙向綁定
const loading = ref(false)
const errorMessage = ref('')
const showExpiredModal = useState('show-expired-modal', () => false)

// 透過 Template Ref 取得子組件內部的 reactive state，用以實現按鈕動態啟用/禁用
const authForm = useTemplateRef('authForm')
const isSubmitDisabled = computed(() => {
  const formState = authForm.value?.state as Record<string, any> | undefined
  if (!formState) return true
  return !formState.UserName?.trim() || !formState.Password?.trim()
})

// 4. 提交登入
async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true
  errorMessage.value = ''
  
  try {
    const { data, error } = await apiRepository.auth.adLogin({
      UserName: event.data.UserName,
      Password: event.data.Password
    })

    if (error.value) {
      errorMessage.value = error.value.data?.message || error.value.message || '登入失敗，請確認帳號與密碼'
      return
    }

    if (data.value && data.value.AccessToken) {
      const accessToken = useCookie('access_token')
      const refreshToken = useCookie('refresh_token')

      // 分開儲存 AccessToken 與 RefreshToken
      accessToken.value = data.value.AccessToken
      refreshToken.value = data.value.RefreshToken || null

      // 登入成功後，重新整理逾期狀態並跳轉首頁
      showExpiredModal.value = false
      await navigateTo('/')
    } else {
      errorMessage.value = '登入失敗：未取得認證授權 Token'
    }
  } catch (err: any) {
    errorMessage.value = err.message || '登入過程發生未知異常'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-dvh items-center justify-center bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 p-6 relative overflow-hidden">
    <!-- 背景光效裝飾，營造高級設計感 -->
    <div class="absolute -top-40 -right-40 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
    <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

    <UCard 
      class="w-full max-w-md shadow-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md transition-all duration-300 hover:shadow-primary-500/5"
      :ui="{ body: 'p-6 sm:p-8' }"
    >
      <UAuthForm
        ref="authForm"
        :fields="fields"
        :schema="schema"
        :submit="{ label: '登入系統', disabled: isSubmitDisabled, block: true }"
        :loading="loading"
        title="企業 AD 登入"
        description="請輸入您的企業 Windows AD 帳密以訪問系統"
        icon="i-lucide-shield-check"
        @submit="onSubmit"
      >
        <!-- 錯誤訊息顯示插槽 -->
        <template #validation>
          <UAlert
            v-if="errorMessage"
            color="error"
            variant="soft"
            :title="errorMessage"
            icon="i-lucide-alert-circle"
            class="mt-4 animate-shake"
          />
        </template>
      </UAuthForm>
    </UCard>

    <!-- 登入逾期提示 Modal (使用自訂通用 BaseModal) -->
    <BaseModal
      v-model:open="showExpiredModal"
      mode="alert"
      title="系統提示"
      description="您的登入已逾期，請重新登入。"
      :prevent-close="true"
      confirm-label="確定"
      @confirm="showExpiredModal = false"
    />
  </div>
</template>

<style scoped>
/* 抖動動畫，用於錯誤提示載入時的微小視覺回饋 */
.animate-shake {
  animation: shake 0.3s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}
</style>
