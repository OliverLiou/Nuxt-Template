<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <Header />
    
    <!-- Sidebar for mobile -->
    <SideBar />
    
    <!-- Main Content -->
    <main class="flex-1">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- <h1 class="text-3xl font-bold text-gray-900 mb-4">{{ $t('welcome') }}</h1> -->
        
        <!-- Page content will be inserted here when using NuxtPage -->
        <!-- <NuxtPage /> -->
      </div>
    </main>
    
    <!-- Footer -->
    <Footer />
  </div>
</template>

<script setup>
// Import components are auto-imported by Nuxt
// No need to explicitly import Header, SideBar, Footer
</script>

<style>
/* Global styles can be added here if needed */
</style>