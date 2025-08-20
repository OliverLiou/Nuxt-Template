<template>
  <header class="bg-white shadow-md sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <div class="flex-shrink-0">
          <NuxtLink to="/" class="flex items-center">
            <div class="w-9 h-9 bg-blue-600 rounded-md flex items-center justify-center">
              <img src="~/assets/imgs/logo.png" alt="Logo">
            </div>
            <span class="ml-2 text-xl font-semibold text-gray-900">Template Web</span>
          </NuxtLink>
        </div>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex space-x-8">
          <NuxtLink 
            to="/" 
            class="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
          >
            {{ $t('nav.home') }}
          </NuxtLink>
          <NuxtLink 
            to="/about" 
            class="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
          >
            {{ $t('nav.about') }}
          </NuxtLink>
          <NuxtLink 
            to="/services" 
            class="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
          >
            {{ $t('nav.services') }}
          </NuxtLink>
          <NuxtLink 
            to="/contact" 
            class="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
          >
            {{ $t('nav.contact') }}
          </NuxtLink>
        </nav>

        <!-- Language Switcher & Mobile Menu Button -->
        <div class="flex items-center space-x-4">
          <!-- Language Switcher -->
          <div class="hidden sm:block">
            <UDropdownMenu
              :items="languageItems"
              :content="{ align: 'center', side: 'bottom', sideOffset: 8 }"
              :ui="{ content: 'w-24'}"
            >
              <UButton 
                icon="i-heroicons-language"
                variant="outline" 
                color="neutral"
                :label="currentLanguage?.name"
              />
            </UDropdownMenu>
          </div>

          <!-- Mobile Menu Button -->
          <UButton
            variant="ghost"
            color="neutral"
            class="md:hidden"
            :aria-label="$t('ui.menu')"
            @click="uiStore.toggleSidebar()"
          >
            <UIcon name="i-heroicons-bars-3" class="h-6 w-6" />
          </UButton>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">

const { $i18n } = useNuxtApp();

const uiStore = useUIStore()
const { locale, locales, setLocale } = $i18n

// 計算當前語言資訊
const currentLanguage = computed(() => {
  return locales.value.find(l => l.code === locale.value)
})

// 語言選項格式化為 UDropdownMenu 所需的格式
const languageItems = computed(() => {
  return locales.value.map(l => ({
    value: l.code,
    label: l.name,
    type: 'checkbox' as const,
    checked: l.code === locale.value,
    onSelect: () => setLocale(l.code),
    onUpdateChecked(checked: boolean) {
      l.checked = checked;
    }
  }))
})
</script>

