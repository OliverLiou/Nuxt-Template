<template>
  <div>
    this is testpage
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  ['icon']: 'lucide:file-text'
})
</script>
