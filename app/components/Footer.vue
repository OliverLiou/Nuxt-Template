<template>
  <footer class="bg-gray-900 text-white">
    <UContainer class="py-4">
      <div class="text-center">
        <!-- Copyright -->
        <p class="text-sm text-gray-300">
          {{ $t('footer.copyright', {year: $moment().format('YYYY')} ) }}
        </p>
      </div>
    </UContainer>
  </footer>
</template>

<script setup>
// Footer component is primarily static
// No reactive logic needed for basic copyright footer
const { $moment } = useNuxtApp();
</script>