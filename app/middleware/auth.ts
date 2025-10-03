export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()
  const toaster = useToast();
  // 如果用戶未登入，阻止訪問受保護的頁面
  if (!authStore.isLoggedIn) {
    toaster.add({
      title: "受保護的頁面",
      description: "請先登入以存取此頁面",
      color: "warning",
      icon: "heroicons-exclamation-circle-16-solid",
      ui: {
        icon: "!size-10"
      }
    });
    return navigateTo('/')
  }
})