<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <Header />
    
    <!-- Sidebar for mobile -->
    <SideBar />
    
    <!-- Main Content -->
    <main class="flex-1">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Page content will be inserted here when using NuxtPage -->
        <UApp :toaster="toaster">
          <NuxtPage />
        </UApp>
      </div>
    </main>
    
    <!-- Footer -->
    <Footer />
  </div>
</template>

<script setup>
// 認證狀態會在 store 中自動初始化

const toaster = {
  position: 'bottom-left',
  pauseOnHover: true,
}
</script>

<style>
/* Global styles can be added here if needed */
</style>