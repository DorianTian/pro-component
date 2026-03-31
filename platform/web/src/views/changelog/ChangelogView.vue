<template>
  <div class="page-container">
    <div class="page-header">
      <h2>Changelog</h2>
    </div>

    <el-card shadow="never">
      <div class="filter-bar">
        <el-select
          v-model="selectedPackage"
          placeholder="Select package"
          filterable
          style="width: 240px"
          @change="loadVersions"
        >
          <el-option
            v-for="pkg in appStore.packages"
            :key="pkg.name"
            :label="pkg.name"
            :value="pkg.name"
          />
        </el-select>
        <el-checkbox v-model="breakingOnly" @change="filterVersions">
          Breaking changes only
        </el-checkbox>
      </div>

      <div v-loading="loading">
        <el-empty
          v-if="!loading && filteredVersions.length === 0"
          description="No versions found"
        />

        <div v-for="version in filteredVersions" :key="version.id" class="version-entry">
          <div class="version-header">
            <div class="version-left">
              <h3 class="version-number">
                {{ version.version }}
              </h3>
              <StatusBadge :status="version.status" />
              <el-tag v-if="hasBreakingChanges(version)" type="danger" size="small" effect="dark">
                BREAKING
              </el-tag>
            </div>
            <span class="version-date">{{ formatDate(version.published_at) }}</span>
          </div>

          <div v-if="version.changelog" class="changelog-content">
            <p>{{ version.changelog }}</p>
          </div>

          <div v-if="hasBreakingChanges(version)" class="breaking-changes">
            <h4 class="breaking-title">
              <el-icon color="#f56c6c">
                <Warning />
              </el-icon>
              Breaking Changes
            </h4>
            <ul>
              <li v-for="(change, i) in version.breaking_changes" :key="i" class="breaking-item">
                <div class="breaking-description">
                  {{ change.description }}
                </div>
                <div v-if="change.migration" class="migration-hint">
                  <strong>Migration:</strong> {{ change.migration }}
                </div>
              </li>
            </ul>
          </div>

          <div v-if="version.dependencies" class="deps-section">
            <el-collapse>
              <el-collapse-item title="Dependencies">
                <div class="deps-list">
                  <el-tag
                    v-for="(depVersion, depName) in version.dependencies"
                    :key="depName as string"
                    size="small"
                    type="info"
                  >
                    {{ depName }}@{{ depVersion }}
                  </el-tag>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>

          <el-divider />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Warning } from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/app'
import { getPackageVersions } from '@/api/versions'
import StatusBadge from '@/components/StatusBadge.vue'

import type { Version } from '@/api/types'

const appStore = useAppStore()

const selectedPackage = ref('')
const loading = ref(false)
const allVersions = ref<Version[]>([])
const breakingOnly = ref(false)

const filteredVersions = computed(() => {
  if (!breakingOnly.value) return allVersions.value
  return allVersions.value.filter(hasBreakingChanges)
})

function hasBreakingChanges(version: Version): boolean {
  return !!version.breaking_changes && version.breaking_changes.length > 0
}

function filterVersions() {
  // Reactivity handles this via filteredVersions computed
}

async function loadVersions() {
  if (!selectedPackage.value) {
    allVersions.value = []
    return
  }
  loading.value = true
  try {
    const versions = await getPackageVersions(selectedPackage.value)
    allVersions.value = versions.sort(
      (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime(),
    )
  } finally {
    loading.value = false
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
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

.filter-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.version-entry {
  padding: 4px 0;
}

.version-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.version-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.version-number {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.version-date {
  font-size: 13px;
  color: #909399;
}

.changelog-content {
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 12px;
}

.changelog-content p {
  margin: 0;
  white-space: pre-wrap;
}

.breaking-changes {
  background: #fef0f0;
  border: 1px solid #fbc4c4;
  border-radius: 4px;
  padding: 12px 16px;
  margin-bottom: 12px;
}

.breaking-title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #f56c6c;
}

.breaking-changes ul {
  margin: 0;
  padding-left: 20px;
}

.breaking-item {
  margin-bottom: 8px;
}

.breaking-description {
  color: #303133;
  font-size: 13px;
}

.migration-hint {
  margin-top: 4px;
  font-size: 12px;
  color: #606266;
  background: #fff;
  padding: 4px 8px;
  border-radius: 2px;
}

.deps-section {
  margin-top: 8px;
}

.deps-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
</style>
