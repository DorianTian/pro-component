import { defineStore } from 'pinia'
import { ref } from 'vue'
import { listApps } from '@/api/apps'
import { listPackages } from '@/api/versions'

import type { App, Package } from '@/api/types'

/** Max items fetched for the app list sidebar (all apps, no pagination) */
const APP_LIST_PAGE_SIZE = 100

export const useAppStore = defineStore('app', () => {
  const apps = ref<App[]>([])
  const packages = ref<Package[]>([])
  const appsLoading = ref(false)
  const packagesLoading = ref(false)
  const sidebarCollapsed = ref(false)

  async function fetchApps() {
    appsLoading.value = true
    try {
      const result = await listApps({ page: 1, pageSize: APP_LIST_PAGE_SIZE })
      apps.value = result.items
    } finally {
      appsLoading.value = false
    }
  }

  async function fetchPackages() {
    packagesLoading.value = true
    try {
      packages.value = await listPackages()
    } finally {
      packagesLoading.value = false
    }
  }

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  return {
    apps,
    packages,
    appsLoading,
    packagesLoading,
    sidebarCollapsed,
    fetchApps,
    fetchPackages,
    toggleSidebar,
  }
})
