<template>
  <div class="page-container">
    <div class="page-header">
      <h2>Publish Management</h2>
      <el-button :icon="Refresh" @click="loadStatuses">Refresh</el-button>
    </div>

    <el-card shadow="never">
      <div class="filter-bar">
        <el-select
          v-model="stateFilter"
          placeholder="Filter by state"
          clearable
          style="width: 200px"
          @change="loadStatuses"
        >
          <el-option label="All" value="" />
          <el-option label="Uploading" value="uploading" />
          <el-option label="Propagating" value="propagating" />
          <el-option label="Verifying" value="verifying" />
          <el-option label="Active" value="active" />
          <el-option label="Failed" value="failed" />
        </el-select>
        <el-switch
          v-model="autoRefresh"
          active-text="Auto-refresh"
          inactive-text=""
          style="margin-left: 12px"
          @change="toggleAutoRefresh"
        />
      </div>

      <el-table v-loading="loading" :data="statuses" stripe style="width: 100%">
        <el-table-column prop="package_name" label="Package" width="200" />
        <el-table-column prop="version" label="Version" width="120" />
        <el-table-column label="State" width="400">
          <template #default="{ row }">
            <StateMachineViz :current-state="row.state" />
          </template>
        </el-table-column>
        <el-table-column label="Status" width="120">
          <template #default="{ row }">
            <StatusBadge :status="row.state" />
          </template>
        </el-table-column>
        <el-table-column prop="started_at" label="Started" width="180">
          <template #default="{ row }">
            {{ formatDate(row.started_at) }}
          </template>
        </el-table-column>
        <el-table-column label="Error" min-width="200">
          <template #default="{ row }">
            <el-text v-if="row.error_message" type="danger" size="small">
              {{ row.error_message }}
            </el-text>
            <span v-else class="text-muted">--</span>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @change="loadStatuses"
        />
      </div>
    </el-card>

    <el-card shadow="never" style="margin-top: 16px">
      <template #header>
        <span>Version Timeline</span>
      </template>
      <PublishTimeline />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { listPublishStatuses } from '@/api/versions'
import StateMachineViz from '@/components/StateMachineViz.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import PublishTimeline from './PublishTimeline.vue'

import type { CdnPublishStatus } from '@/api/types'

/** Auto-refresh interval for publish status polling (ms) */
const AUTO_REFRESH_INTERVAL_MS = 5_000
/** Default page size for publish status list */
const DEFAULT_PAGE_SIZE = 20

const statuses = ref<CdnPublishStatus[]>([])
const loading = ref(false)
const stateFilter = ref('')
const page = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)
const total = ref(0)
const autoRefresh = ref(false)
let refreshTimer: ReturnType<typeof setInterval> | null = null

async function loadStatuses() {
  loading.value = true
  try {
    const result = await listPublishStatuses({
      page: page.value,
      pageSize: pageSize.value,
      state: stateFilter.value || undefined,
    })
    statuses.value = result.items
    total.value = result.total
  } finally {
    loading.value = false
  }
}

function toggleAutoRefresh(enabled: boolean | string | number) {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
  if (enabled) {
    refreshTimer = setInterval(loadStatuses, AUTO_REFRESH_INTERVAL_MS)
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

onMounted(loadStatuses)

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
})
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
  margin-bottom: 16px;
}

.text-muted {
  color: #c0c4cc;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
