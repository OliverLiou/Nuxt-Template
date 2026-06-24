<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

// 1. 定義頁籤項目
const loginTabs = [
  {
    label: '企業 AD 登入',
    icon: 'i-lucide-shield-check',
    slot: 'ad' as const
  },
  {
    label: '一般帳號登入',
    icon: 'i-lucide-lock',
    slot: 'general' as const
  }
]

// 2. 企業 AD 登入設定
const adFields = [
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

const adSchema = z.object({
  UserName: z.string().min(1, '請輸入 AD 帳號'),
  Password: z.string().min(1, '請輸入密碼')
})

type AdSchema = z.output<typeof adSchema>

const adAuthForm = useTemplateRef('adAuthForm')
const isAdSubmitDisabled = computed(() => {
  const formState = adAuthForm.value?.state as Record<string, any> | undefined
  if (!formState) return true
  return !formState.UserName?.trim() || !formState.Password?.trim()
})

// 3. 一般登入設定
const generalFields = [
  {
    name: 'UserName',
    label: '帳號',
    type: 'text',
    placeholder: '請輸入使用者帳號',
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

const generalSchema = z.object({
  UserName: z.string().min(1, '請輸入帳號'),
  Password: z.string().min(1, '請輸入密碼')
})

type GeneralSchema = z.output<typeof generalSchema>

const generalAuthForm = useTemplateRef('generalAuthForm')
const isGeneralSubmitDisabled = computed(() => {
  const formState = generalAuthForm.value?.state as Record<string, any> | undefined
  if (!formState) return true
  return !formState.UserName?.trim() || !formState.Password?.trim()
})

// 4. 狀態控制與雙向綁定
const loading = ref(false)
const errorMessage = ref('')

// 5. 共同登入成功處理
async function handleLoginSuccess(authData: any) {
  if (authData && authData.AccessToken) {
    const accessToken = useCookie('access_token')
    const refreshToken = useCookie('refresh_token')

    // 分開儲存 AccessToken 與 RefreshToken
    accessToken.value = authData.AccessToken
    refreshToken.value = authData.RefreshToken || null

    // 登入成功後，關閉全域逾期對話視窗並跳轉首頁
    const systemStore = useSystemStore()
    systemStore.isOpen = false
    await navigateTo('/')
  } else {
    errorMessage.value = '登入失敗：未取得認證授權 Token'
  }
}

// 6. 提交 AD 登入
async function onAdSubmit(event: FormSubmitEvent<AdSchema>) {
  loading.value = true
  errorMessage.value = ''
  
  try {
    const data = await apiRepository.auth.adLogin({
      UserName: event.data.UserName,
      Password: event.data.Password
    })

    await handleLoginSuccess(data)
  } catch (err: any) {
    errorMessage.value = err.data?.message || err.message || '登入失敗，請確認帳號與密碼'
  } finally {
    loading.value = false
  }
}

// 7. 提交一般登入
async function onGeneralSubmit(event: FormSubmitEvent<GeneralSchema>) {
  loading.value = true
  errorMessage.value = ''
  
  try {
    const data = await apiRepository.auth.login({
      UserName: event.data.UserName,
      Password: event.data.Password
    })

    await handleLoginSuccess(data)
  } catch (err: any) {
    errorMessage.value = err.data?.message || err.message || '登入失敗，請確認帳號與密碼'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-dvh items-center justify-center bg-linear-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 p-6 relative overflow-hidden">
    <!-- 背景光效裝飾，營造高級設計感 -->
    <div class="absolute -top-40 -right-40 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
    <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

    <UCard 
      class="w-full max-w-md shadow-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md transition-all duration-300 hover:shadow-primary-500/5"
      :ui="{ body: 'p-6 sm:p-8' }"
    >
      <UTabs :items="loginTabs" class="w-full" @change="errorMessage = ''">
        <!-- 企業 AD 登入 Tab -->
        <template #ad>
          <UAuthForm
            ref="adAuthForm"
            :fields="adFields"
            :schema="adSchema"
            :submit="{ label: '登入系統 (AD)', disabled: isAdSubmitDisabled, block: true }"
            :loading="loading"
            description="請輸入您的企業 Windows AD 帳密以訪問系統"
            class="mt-4"
            @submit="onAdSubmit"
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
        </template>

        <!-- 一般帳號登入 Tab -->
        <template #general>
          <UAuthForm
            ref="generalAuthForm"
            :fields="generalFields"
            :schema="generalSchema"
            :submit="{ label: '登入系統', disabled: isGeneralSubmitDisabled, block: true }"
            :loading="loading"
            description="請輸入您的系統帳密以訪問系統"
            class="mt-4"
            @submit="onGeneralSubmit"
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
        </template>
      </UTabs>
    </UCard>
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
