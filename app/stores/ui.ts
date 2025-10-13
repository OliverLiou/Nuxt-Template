// import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUIStore = defineStore('ui', () => {
  const isSidebarOpen = ref(false)

  const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value
  }

  const closeSidebar = () => {
    isSidebarOpen.value = false
  }

  const openSidebar = () => {
    isSidebarOpen.value = true
  }

  return {
    isSidebarOpen,
    toggleSidebar,
    closeSidebar,
    openSidebar
  }
})