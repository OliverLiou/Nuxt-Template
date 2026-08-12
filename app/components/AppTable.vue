<script setup lang="ts" generic="T extends TableData">
import type {
  TableData,
  TableProps,
  TableSlots
} from '@nuxt/ui'
import type { Table } from '@tanstack/vue-table'
import type { HTMLAttributes } from 'vue'

defineOptions({
  inheritAttrs: false
})

type AppTableProps<T extends TableData> = TableProps<T> & {
  infiniteScroll?: boolean
  hasMore?: boolean
  infiniteScrollDistance?: number
  total?: number
  rootClass?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<AppTableProps<T>>(), {
  infiniteScroll: false,
  hasMore: false,
  infiniteScrollDistance: 200
})

const emit = defineEmits<{
  'load-more': []
}>()

const slots = defineSlots<TableSlots<T> & {
  header?: () => unknown
}>()
const attrs = useAttrs()

interface TableExposed<T extends TableData> {
  $el?: HTMLElement
  tableApi: Table<T>
}

const table = useTemplateRef<TableExposed<T>>('table')
const tableElement = computed(() => table.value?.$el)
const tableSlots = computed(() => (
  Object.fromEntries(
    Object.entries(slots).filter(([name]) => name !== 'header')
  )
))
const forwardedProps = computed(() => {
  const {
    infiniteScroll: _infiniteScroll,
    hasMore: _hasMore,
    infiniteScrollDistance: _infiniteScrollDistance,
    total: _total,
    rootClass: _rootClass,
    class: _class,
    ui: _ui,
    ...tableProps
  } = props

  return tableProps
})
const tableBindings = computed(() => ({
  ...forwardedProps.value,
  ...attrs
}))
const tableUi = computed(() => ({
  ...props.ui,
  th: ['whitespace-nowrap', props.ui?.th],
  td: ['h-10 truncate py-2', props.ui?.td],
  separator: ['z-2', props.ui?.separator]
}))

function scrollToTop() {
  tableElement.value?.scrollTo({ top: 0 })
}

useTableInfiniteScroll({
  target: tableElement,
  enabled: () => props.infiniteScroll,
  loading: () => props.loading ?? false,
  hasMore: () => props.hasMore,
  distance: props.infiniteScrollDistance,
  onLoadMore: () => emit('load-more')
})

defineExpose({
  get tableApi() {
    return table.value?.tableApi
  },
  get rootElement() {
    return tableElement.value
  },
  scrollToTop
})
</script>

<template>
  <div
    :class="[
      'flex min-h-0 min-w-0 w-full flex-1 flex-col divide-y divide-accented overflow-hidden rounded-lg border border-default',
      rootClass
    ]"
  >
    <slot name="header" />

    <div class="min-h-0 min-w-0 flex-1">
      <UTable
        ref="table"
        v-bind="tableBindings"
        :class="['h-full', props.class]"
        :ui="tableUi"
      >
        <template
          v-for="(_, name) in tableSlots"
          #[name]="slotProps"
        >
          <slot
            :name="name"
            v-bind="slotProps"
          />
        </template>
      </UTable>
    </div>

    <div
      v-if="total !== undefined"
      class="flex min-h-10 items-center justify-end px-3.5 py-2 text-sm text-muted"
    >
      <span>共 {{ total }} 筆資料</span>
    </div>
  </div>
</template>
