<script setup lang="ts">

// 定義對話視窗模式
export type ModalMode = 'alert' | 'confirm'

const props = withDefaults(defineProps<{
  /** 對話視窗顯示狀態 */
  open?: boolean
  /** 模式：'alert' (單確認按鈕) 或 'confirm' (確認與取消雙按鈕) */
  mode?: ModalMode
  /** 對話視窗標題 */
  title?: string
  /** 對話視窗文字說明 (若傳入插槽則會被插槽內容覆蓋) */
  description?: string
  /** 確認按鈕標籤 */
  confirmLabel?: string
  /** 取消按鈕標籤 */
  cancelLabel?: string
  /** 是否防止點擊背景或按 ESC 關閉 */
  preventClose?: boolean
}>(), {
  open: false,
  mode: 'confirm',
  confirmLabel: '確定',
  cancelLabel: '取消',
  preventClose: false
})

const emit = defineEmits<{
  (e: 'update:open', val: boolean): void
  /** 按下確認按鈕時觸發 */
  (e: 'confirm'): void
  /** 按下取消按鈕時觸發 */
  (e: 'cancel'): void
}>()

// 雙向綁定對話視窗的開啟狀態
const isOpen = computed({
  get: () => props.open,
  set: (val) => emit('update:open', val)
})

// 確認處理
function handleConfirm() {
  emit('confirm')
  isOpen.value = false
}

// 取消處理
function handleCancel() {
  emit('cancel')
  isOpen.value = false
}
</script>

<template>
  <UModal
    v-model:open="isOpen"
    :title="title"
    :description="description"
    :prevent-close="preventClose"
  >
    <!-- 若有傳入預設插槽內容，則顯示於對話視窗 Body 區域 -->
    <template v-if="$slots.default" #body>
      <slot />
    </template>

    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <!-- 僅在 confirm 模式下顯示取消按鈕 -->
        <UButton
          v-if="mode === 'confirm'"
          :label="cancelLabel"
          color="neutral"
          variant="outline"
          @click="handleCancel"
        />
        <UButton
          :label="confirmLabel"
          color="primary"
          @click="handleConfirm"
        />
      </div>
    </template>
  </UModal>
</template>
