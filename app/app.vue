<script setup lang="ts">
const systemStore = useSystemStore()
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <!-- 全域 BaseModal -->
    <BaseModal
      v-model:open="systemStore.isOpen"
      :mode="systemStore.mode"
      :title="systemStore.title"
      :description="systemStore.description"
      :confirm-label="systemStore.confirmLabel"
      :cancel-label="systemStore.cancelLabel"
      :prevent-close="systemStore.preventClose"
      @confirm="systemStore.handleConfirm"
      @cancel="systemStore.handleCancel"
    />
  </UApp>
</template>

