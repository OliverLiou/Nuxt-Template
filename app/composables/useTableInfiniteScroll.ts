import { useInfiniteScroll } from '@vueuse/core'
import type { MaybeRefOrGetter } from 'vue'

interface UseTableInfiniteScrollOptions {
  target: MaybeRefOrGetter<HTMLElement | null | undefined>
  enabled?: MaybeRefOrGetter<boolean>
  loading?: MaybeRefOrGetter<boolean>
  hasMore?: MaybeRefOrGetter<boolean>
  distance?: number
  onLoadMore: () => void | Promise<void>
}

export function useTableInfiniteScroll(options: UseTableInfiniteScrollOptions) {
  const isLoadTriggered = ref(false)
  const scrollTarget = computed(() => (
    toValue(options.enabled ?? false)
      ? toValue(options.target)
      : null
  ))

  watch(
    () => toValue(options.loading ?? false),
    loading => {
      if (!loading) {
        isLoadTriggered.value = false
      }
    }
  )

  return useInfiniteScroll(
    scrollTarget,
    async () => {
      if (isLoadTriggered.value) {
        return
      }

      isLoadTriggered.value = true

      try {
        await options.onLoadMore()
        await nextTick()
      } finally {
        if (!toValue(options.loading ?? false)) {
          isLoadTriggered.value = false
        }
      }
    },
    {
      distance: options.distance ?? 200,
      canLoadMore: () => (
        toValue(options.enabled ?? false)
        && !toValue(options.loading ?? false)
        && toValue(options.hasMore ?? false)
        && !isLoadTriggered.value
      )
    }
  )
}
