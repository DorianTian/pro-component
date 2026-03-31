import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getAppVersions } from '@/api/apps'
import { listPublishStatuses } from '@/api/versions'

import type { AppVersionMap, CdnPublishStatus } from '@/api/types'

/** Default page size for publish status list */
const DEFAULT_PAGE_SIZE = 20

export const useVersionStore = defineStore('version', () => {
  const versionMaps = ref<AppVersionMap[]>([])
  const versionMapsLoading = ref(false)

  const publishStatuses = ref<CdnPublishStatus[]>([])
  const publishLoading = ref(false)
  const publishTotal = ref(0)
  const publishPage = ref(1)
  const publishPageSize = ref(DEFAULT_PAGE_SIZE)
  const publishStateFilter = ref('')

  async function fetchVersionMaps(appId: string) {
    if (!appId) {
      versionMaps.value = []
      return
    }
    versionMapsLoading.value = true
    try {
      versionMaps.value = await getAppVersions(appId)
    } finally {
      versionMapsLoading.value = false
    }
  }

  async function fetchPublishStatuses() {
    publishLoading.value = true
    try {
      const result = await listPublishStatuses({
        page: publishPage.value,
        pageSize: publishPageSize.value,
        state: publishStateFilter.value || undefined,
      })
      publishStatuses.value = result.items
      publishTotal.value = result.total
    } finally {
      publishLoading.value = false
    }
  }

  return {
    versionMaps,
    versionMapsLoading,
    publishStatuses,
    publishLoading,
    publishTotal,
    publishPage,
    publishPageSize,
    publishStateFilter,
    fetchVersionMaps,
    fetchPublishStatuses,
  }
})
