<script setup lang="ts">
export interface HistoryTimelineEntry {
  id: string
  editorName: string
  editorAvatarUrl?: string
  changeCount: number
  executeTime?: string
}

const props = defineProps<{ items: HistoryTimelineEntry[] }>()
defineSlots<{ content?: (props: { item: HistoryTimelineEntry }) => any }>()

const timelineItems = computed(() => props.items.map(item => ({
  ...item,
  avatar: {
    src: item.editorAvatarUrl,
    alt: item.editorName,
    icon: 'i-lucide-user'
  }
})))
</script>

<template>
  <UTimeline
    v-if="items.length"
    :items="timelineItems"
    size="md"
    :ui="{
      root: 'gap-0',
      item: 'gap-3',
      container: 'shrink-0 gap-1.5 pt-2',
      indicator: 'size-9',
      separator: 'bg-accented',
      wrapper: 'min-w-0 mt-0 pb-3'
    }"
  >
    <template #wrapper="{ item }">
      <HistoryTimelineItem :key="item.id" :item="item">
        <template v-if="$slots.content" #content="{ item: entry }">
          <slot name="content" :item="entry" />
        </template>
      </HistoryTimelineItem>
    </template>
  </UTimeline>
  <p v-else class="py-8 text-center text-sm text-muted">尚無異動紀錄</p>
</template>
