<template>
  <div class="page-container">
    <div class="page-header">
      <h2>Compatibility Matrix</h2>
    </div>

    <el-card shadow="never" class="filter-card">
      <el-form inline>
        <el-form-item label="Package">
          <el-select
            v-model="selectedPackage"
            placeholder="Select package"
            filterable
            style="width: 240px"
            @change="handlePackageChange"
          >
            <el-option
              v-for="pkg in appStore.packages"
              :key="pkg.name"
              :label="pkg.name"
              :value="pkg.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Version">
          <el-select
            v-model="selectedVersion"
            placeholder="Select version"
            filterable
            style="width: 160px"
            :disabled="!selectedPackage"
            @change="loadMatrix"
          >
            <el-option v-for="v in packageVersions" :key="v" :label="v" :value="v" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button :icon="Refresh" @click="loadMatrix"> Refresh </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card v-if="selectedPackage && selectedVersion" shadow="never" style="margin-top: 16px">
      <div class="legend">
        <span class="legend-item"> <span class="legend-dot pass" />Pass </span>
        <span class="legend-item"> <span class="legend-dot fail" />Fail </span>
        <span class="legend-item"> <span class="legend-dot untested" />Untested </span>
      </div>

      <div v-loading="loading" class="matrix-wrapper">
        <table class="compat-table">
          <thead>
            <tr>
              <th class="corner-cell">Vue \ EP</th>
              <th v-for="ep in epVersions" :key="ep">
                {{ ep }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="vue in vueVersions" :key="vue">
              <td class="row-header">
                {{ vue }}
              </td>
              <td
                v-for="ep in epVersions"
                :key="`${vue}-${ep}`"
                class="matrix-cell"
                :class="getCellClass(vue, ep)"
                @click="handleCellClick(vue, ep)"
              >
                <el-tooltip :content="getCellTooltip(vue, ep)" placement="top">
                  <span class="cell-content">
                    <el-icon v-if="getCellStatus(vue, ep) === 'pass'" color="#67c23a"
                      ><CircleCheckFilled
                    /></el-icon>
                    <el-icon v-else-if="getCellStatus(vue, ep) === 'fail'" color="#f56c6c"
                      ><CircleCloseFilled
                    /></el-icon>
                    <el-icon v-else color="#c0c4cc"><QuestionFilled /></el-icon>
                  </span>
                </el-tooltip>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </el-card>

    <el-empty v-else description="Select a package and version to view the compatibility matrix" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/app'
import { getCompatResults } from '@/api/compat'
import { getPackageVersions } from '@/api/versions'

import type { CompatResult, CompatStatus } from '@/api/types'

/** Separator for creating composite map keys from version pairs */
const VERSION_KEY_SEPARATOR = '::'

const appStore = useAppStore()

const selectedPackage = ref('')
const selectedVersion = ref('')
const loading = ref(false)
const results = ref<CompatResult[]>([])
const packageVersions = ref<string[]>([])

const vueVersions = computed(() => {
  const versions = new Set(results.value.map((r) => r.vue_version))
  return [...versions].sort()
})

const epVersions = computed(() => {
  const versions = new Set(results.value.map((r) => r.element_plus_version))
  return [...versions].sort()
})

async function handlePackageChange(pkg: string) {
  selectedVersion.value = ''
  packageVersions.value = []
  if (!pkg) return
  try {
    const versions = await getPackageVersions(pkg)
    packageVersions.value = versions.map((v) => v.version)
  } catch {
    // API failure -- reset to empty so UI shows no versions
    packageVersions.value = []
  }
}

function getResultKey(vueVersion: string, epVersion: string): string {
  return `${vueVersion}${VERSION_KEY_SEPARATOR}${epVersion}`
}

const resultMap = computed(() => {
  const map = new Map<string, CompatResult>()
  for (const r of results.value) {
    map.set(getResultKey(r.vue_version, r.element_plus_version), r)
  }
  return map
})

function getCellStatus(vueVersion: string, epVersion: string): CompatStatus {
  return resultMap.value.get(getResultKey(vueVersion, epVersion))?.status ?? 'untested'
}

function getCellClass(vueVersion: string, epVersion: string): string {
  return `cell-${getCellStatus(vueVersion, epVersion)}`
}

function getCellTooltip(vueVersion: string, epVersion: string): string {
  const result = resultMap.value.get(getResultKey(vueVersion, epVersion))
  if (!result) return `Vue ${vueVersion} x EP ${epVersion}: Untested`
  const date = result.tested_at ? new Date(result.tested_at).toLocaleDateString() : 'unknown'
  return `Vue ${vueVersion} x EP ${epVersion}: ${result.status.toUpperCase()} (${date})`
}

function handleCellClick(vueVersion: string, epVersion: string) {
  const result = resultMap.value.get(getResultKey(vueVersion, epVersion))
  if (result?.ci_run_url) {
    window.open(result.ci_run_url, '_blank')
  }
}

async function loadMatrix() {
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
</script>

<style scoped>
.page-container {
  padding: 4px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.legend {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #606266;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

.legend-dot.pass {
  background: #f0f9eb;
  border: 1px solid #67c23a;
}

.legend-dot.fail {
  background: #fef0f0;
  border: 1px solid #f56c6c;
}

.legend-dot.untested {
  background: #f4f4f5;
  border: 1px solid #c0c4cc;
}

.matrix-wrapper {
  overflow-x: auto;
}

.compat-table {
  border-collapse: collapse;
  width: auto;
}

.compat-table th,
.compat-table td {
  border: 1px solid #ebeef5;
  padding: 12px 16px;
  text-align: center;
  font-size: 13px;
  white-space: nowrap;
}

.corner-cell {
  background: #f5f7fa;
  font-weight: 600;
  color: #303133;
}

.compat-table th {
  background: #f5f7fa;
  font-weight: 600;
  color: #303133;
}

.row-header {
  background: #f5f7fa;
  font-weight: 600;
  color: #303133;
  text-align: left;
}

.matrix-cell {
  cursor: pointer;
  transition: background 0.2s;
  min-width: 60px;
}

.matrix-cell:hover {
  filter: brightness(0.95);
}

.cell-pass {
  background: #f0f9eb;
}

.cell-fail {
  background: #fef0f0;
}

.cell-untested {
  background: #f4f4f5;
}

.cell-content {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
