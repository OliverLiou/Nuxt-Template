<template>
  <UFooter
    :ui="{
      root: 'bg-gray-900 text-white',
      container: 'max-w-10xl px-4 sm:px-4 lg:px-6'
    }"
  >
    <!-- <template #left> -->
      <p class="text-sm text-gray-300">
        {{ $t('footer.copyright', {year: $moment().format('YYYY')} ) }}
      </p>
    <!-- </template> -->
  </UFooter>
</template>

<script setup lang="ts">
import type { Moment } from 'moment' 
// Footer component is primarily static
// No reactive logic needed for basic copyright footer
const { $moment } = useNuxtApp()
</script>