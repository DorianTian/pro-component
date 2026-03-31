<template>
  <div class="page-container">
    <div class="page-header">
      <h2>App Management</h2>
      <el-button
        v-if="authStore.hasPermission('operator')"
        type="primary"
        :icon="Plus"
        @click="showCreateForm = true"
      >
        New App
      </el-button>
    </div>

    <el-card shadow="never">
      <div class="filter-bar">
        <el-input
          v-model="keyword"
          placeholder="Search by app ID or name..."
          clearable
          :prefix-icon="Search"
          style="width: 300px"
          @input="debouncedSearch"
        />
        <el-button :icon="Refresh" @click="loadApps">Refresh</el-button>
      </div>

      <el-table v-loading="loading" :data="apps" stripe style="width: 100%">
        <el-table-column prop="app_id" label="App ID" width="180" />
        <el-table-column prop="name" label="Name" min-width="200" />
        <el-table-column prop="owner" label="Owner" width="150" />
        <el-table-column prop="created_at" label="Created" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="authStore.hasPermission('operator')"
              size="small"
              @click="handleEdit(row)"
            >
              Edit
            </el-button>
            <el-button size="small" type="primary" @click="goToVersions(row.app_id)">
              Versions
            </el-button>
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
          @change="loadApps"
        />
      </div>
    </el-card>

    <AppForm v-model="showCreateForm" :editing-app="editingApp" @saved="handleSaved" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Search, Refresh } from '@element-plus/icons-vue'
import { useDebounceFn } from '@vueuse/core'
import { useAuthStore } from '@/stores/auth'
import { listApps } from '@/api/apps'
import AppForm from './AppForm.vue'

import type { App } from '@/api/types'

/** Debounce delay for search input (ms) */
const SEARCH_DEBOUNCE_MS = 300
/** Default page size for app list */
const DEFAULT_PAGE_SIZE = 20

const router = useRouter()
const authStore = useAuthStore()

const apps = ref<App[]>([])
const loading = ref(false)
const keyword = ref('')
const page = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)
const total = ref(0)
const showCreateForm = ref(false)
const editingApp = ref<App | null>(null)

async function loadApps() {
  loading.value = true
  try {
    const result = await listApps({
      page: page.value,
      pageSize: pageSize.value,
      keyword: keyword.value || undefined,
    })
    apps.value = result.items
    total.value = result.total
  } finally {
    loading.value = false
  }
}

const debouncedSearch = useDebounceFn(() => {
  page.value = 1
  loadApps()
}, SEARCH_DEBOUNCE_MS)

function handleEdit(app: App) {
  editingApp.value = app
  showCreateForm.value = true
}

function handleSaved() {
  showCreateForm.value = false
  editingApp.value = null
  loadApps()
}

function goToVersions(appId: string) {
  router.push({ path: '/version-map', query: { appId } })
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(loadApps)
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
  gap: 12px;
  margin-bottom: 16px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
