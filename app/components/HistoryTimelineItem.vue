<script setup lang="ts">
import type { HistoryTimelineEntry } from './HistoryTimeline.vue'

defineProps<{ item: HistoryTimelineEntry }>()
defineSlots<{ content?: (props: { item: HistoryTimelineEntry }) => any }>()
const open = ref(false)
</script>

<template>
  <UCollapsible v-model:open="open" class="w-full">
    <UButton
      color="neutral"
      variant="outline"
      class="flex w-full items-center gap-2 rounded-lg"
    >
      <UBadge color="info" variant="subtle" class="min-w-0 shrink">
        <span class="truncate">{{ item.editorName }}</span>
      </UBadge>
      <div class="ml-auto flex shrink-0 flex-col items-end gap-1">
        <UBadge color="warning" variant="subtle" size="sm">異動 {{ item.changeCount }} 筆</UBadge>
        <UBadge color="neutral" variant="soft" size="sm">
          {{ formatDate(item.executeTime) || '—' }}
        </UBadge>
      </div>
      <UIcon
        name="i-lucide-chevron-down"
        class="size-5 shrink-0 text-muted transition-transform"
        :class="{ 'rotate-180': open }"
        aria-hidden="true"
      />
    </UButton>
    <template #content>
      <div class="pt-2">
        <slot name="content" :item="item">
          <div class="rounded-lg border border-dashed border-accented bg-elevated/50 px-3 py-4 text-sm text-muted">
            異動內容待提供
          </div>
        </slot>
      </div>
    </template>
  </UCollapsible>
</template>
