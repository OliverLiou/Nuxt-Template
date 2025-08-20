<template>
  <!-- Overlay -->
  <Transition name="overlay">
    <div
      v-if="uiStore.isSidebarOpen"
      class="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
      @click="uiStore.closeSidebar()"
    ></div>
  </Transition>

  <!-- Sidebar -->
  <Transition name="sidebar">
    <aside
      v-if="uiStore.isSidebarOpen"
      class="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-50 md:hidden"
    >
      <!-- Sidebar Header -->
      <div class="flex items-center justify-between p-4 border-b border-gray-500">
        <div class="flex items-center">
          <div class="w-8 h-8">
            <img src="~/assets/imgs/logo.png" alt="Logo">
          </div>

          <span class="ml-2 text-lg font-semibold text-gray-900">Oliver Template</span>
        </div>
        <!-- Original close button (commented for reference) -->
        <!-- 
        <button
          @click="uiStore.closeSidebar()"
          class="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          :aria-label="$t('ui.close')"
        >
          <svg
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        -->
        
        <!-- Updated with UButton and UIcon -->
        <UButton
          @click="uiStore.closeSidebar()"
          variant="ghost"
          color="neutral"
          :label="$t('ui.close')"
        >
          <UIcon name="i-heroicons-x-mark" class="h-5 w-5" />
        </UButton>
      </div>

      <!-- Navigation Links -->
      <!-- <nav class="mt-4">
        <NuxtLink
          to="/"
          @click="uiStore.closeSidebar()"
          class="block px-4 py-3 text-gray-900 hover:bg-gray-100 hover:text-blue-600 transition-colors border-l-4 border-transparent hover:border-blue-600"
        >
          {{ $t('nav.home') }}
        </NuxtLink>
        <NuxtLink
          to="/about"
          @click="uiStore.closeSidebar()"
          class="block px-4 py-3 text-gray-900 hover:bg-gray-100 hover:text-blue-600 transition-colors border-l-4 border-transparent hover:border-blue-600"
        >
          {{ $t('nav.about') }}
        </NuxtLink>
        <NuxtLink
          to="/services"
          @click="uiStore.closeSidebar()"
          class="block px-4 py-3 text-gray-900 hover:bg-gray-100 hover:text-blue-600 transition-colors border-l-4 border-transparent hover:border-blue-600"
        >
          {{ $t('nav.services') }}
        </NuxtLink>
        <NuxtLink
          to="/contact"
          @click="uiStore.closeSidebar()"
          class="block px-4 py-3 text-gray-900 hover:bg-gray-100 hover:text-blue-600 transition-colors border-l-4 border-transparent hover:border-blue-600"
        >
          {{ $t('nav.contact') }}
        </NuxtLink>
      </nav> -->

      <!-- Language Switcher -->
      <div class="p-4 mt-auto">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ $t("ui.language") }}
        </label>
        <USelect 
          v-model="selectedLocale" 
          :items="languageItems"
          class="w-full text-sm border border-gray-600 rounded-md px-3 py-2"
          @change="changeLocale"
        />
      </div>
    </aside>
  </Transition>
</template>

<script setup lang="ts">

const { $i18n } = useNuxtApp();
const { locales } = $i18n;
const uiStore = useUIStore();

const selectedLocale = ref($i18n.locale.value);

const changeLocale = () => {
  $i18n.setLocale(selectedLocale.value);
};

const languageItems = computed(() => {
  return locales.value.map((l) => ({
    label: l.name,
    value: l.code,
  }));
});

watch(
  () => $i18n.locale.value,
  (newLocale) => {
    selectedLocale.value = newLocale;
  }
);

// Close sidebar when route changes
const route = useRoute();
watch(() => route.path,
  () => {
    uiStore.closeSidebar();
  }
);
</script>

<style scoped>
/* Overlay transitions */
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.3s ease;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

/* Sidebar transitions */
.sidebar-enter-active,
.sidebar-leave-active {
  transition: transform 0.3s ease;
}

.sidebar-enter-from,
.sidebar-leave-to {
  transform: translateX(-100%);
}
</style>
