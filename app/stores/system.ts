import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ModalMode } from '../components/BaseModal.vue'

export interface ModalOptions {
  mode?: ModalMode
  title?: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  preventClose?: boolean
  onConfirm?: () => void
  onCancel?: () => void
}

export const useSystemStore = defineStore('system', () => {
  const isOpen = ref(false)
  const mode = ref<ModalMode>('alert')
  const title = ref('系統提示')
  const description = ref('')
  const confirmLabel = ref('確定')
  const cancelLabel = ref('取消')
  const preventClose = ref(false)
  
  // 保存動態 Callback
  let resolveCallback: ((value: boolean) => void) | null = null

  /**
   * 開啟全域對話視窗，並返回 Promise 以便在呼叫端使用 async/await 處理確認/取消
   */
  function openModal(options: ModalOptions): Promise<boolean> {
    isOpen.value = true
    mode.value = options.mode || 'alert'
    title.value = options.title || '系統提示'
    description.value = options.description
    confirmLabel.value = options.confirmLabel || '確定'
    cancelLabel.value = options.cancelLabel || '取消'
    preventClose.value = options.preventClose ?? false

    // 支援 Callback 方式
    if (options.onConfirm || options.onCancel) {
      resolveCallback = (confirmed) => {
        if (confirmed && options.onConfirm) options.onConfirm()
        if (!confirmed && options.onCancel) options.onCancel()
      }
    } else {
      resolveCallback = null
    }

    // 同時返回 Promise 格式，增加使用靈活性
    return new Promise<boolean>((resolve) => {
      const originalResolve = resolveCallback
      resolveCallback = (confirmed) => {
        if (originalResolve) originalResolve(confirmed)
        resolve(confirmed)
      }
    })
  }

  function handleConfirm() {
    isOpen.value = false
    if (resolveCallback) resolveCallback(true)
  }

  function handleCancel() {
    isOpen.value = false
    if (resolveCallback) resolveCallback(false)
  }

  return {
    isOpen,
    mode,
    title,
    description,
    confirmLabel,
    cancelLabel,
    preventClose,
    openModal,
    handleConfirm,
    handleCancel
  }
})
