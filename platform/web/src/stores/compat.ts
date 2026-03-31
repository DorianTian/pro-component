import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getCompatResults } from '@/api/compat'
import { getPackageVersions } from '@/api/versions'

import type { CompatResult } from '@/api/types'

export const useCompatStore = defineStore('compat', () => {
  const selectedPackage = ref('')
  const selectedVersion = ref('')
  const results = ref<CompatResult[]>([])
  const packageVersions = ref<string[]>([])
  const loading = ref(false)

  async function fetchVersionsForPackage(packageName: string) {
    selectedPackage.value = packageName
    selectedVersion.value = ''
    packageVersions.value = []
    if (!packageName) return
    try {
      const versions = await getPackageVersions(packageName)
      packageVersions.value = versions.map((v) => v.version)
    } catch {
      packageVersions.value = []
    }
  }

  async function fetchResults() {
    if (!selectedPackage.value || !selectedVersion.value) return
    loading.value = true
    try {
      results.value = await getCompatResults(selectedPackage.value, {
        version: selectedVersion.value,
      })
    } finally {
      loading.value = false
    }
  }

  function reset() {
    selectedPackage.value = ''
    selectedVersion.value = ''
    results.value = []
    packageVersions.value = []
  }

  return {
    selectedPackage,
    selectedVersion,
    results,
    packageVersions,
    loading,
    fetchVersionsForPackage,
    fetchResults,
    reset,
  }
})
