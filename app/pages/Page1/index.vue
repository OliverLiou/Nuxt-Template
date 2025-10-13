<template>
  <div>
    {{ $t("pages.page1.heading") }}
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  ['icon']: 'lucide:file-text'
})
</script>
