<template>
  <div>{{ $t("pages.index.heading") }}</div>
</template>

<script setup lang="ts">
definePageMeta({
  // middleware: 'auth'
})

const authStore = useAuthStore()
const { user, token, isLoggedIn } = storeToRefs(authStore)
onMounted(() => {
  // console.log(user.value, token.value, isLoggedIn.value)
})
</script>
