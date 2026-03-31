import { defineStore } from 'pinia'
import { ref } from 'vue'
import { listGrayscaleRules } from '@/api/grayscale'

import type { GrayscaleRule } from '@/api/types'

/** Default page size for grayscale rule list */
const DEFAULT_PAGE_SIZE = 20

export const useGrayscaleStore = defineStore('grayscale', () => {
  const rules = ref<GrayscaleRule[]>([])
  const loading = ref(false)
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(DEFAULT_PAGE_SIZE)
  const appFilter = ref('')
  const statusFilter = ref('')

  async function fetchRules() {
    loading.value = true
    try {
      const result = await listGrayscaleRules({
        app_id: appFilter.value || undefined,
        status: statusFilter.value || undefined,
        page: page.value,
        pageSize: pageSize.value,
      })
      rules.value = result.items
      total.value = result.total
    } finally {
      loading.value = false
    }
  }

  function resetFilters() {
    appFilter.value = ''
    statusFilter.value = ''
    page.value = 1
  }

  return {
    rules,
    loading,
    total,
    page,
    pageSize,
    appFilter,
    statusFilter,
    fetchRules,
    resetFilters,
  }
})
