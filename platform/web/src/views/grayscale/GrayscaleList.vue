<template>
  <div class="page-container">
    <div class="page-header">
      <h2>Grayscale Strategy</h2>
      <el-button
        v-if="authStore.hasPermission('operator')"
        type="primary"
        :icon="Plus"
        @click="showForm = true"
      >
        New Strategy
      </el-button>
    </div>

    <el-row :gutter="16" class="stats-row">
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <el-statistic title="Active" :value="activeCount" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <el-statistic title="Paused" :value="pausedCount" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <el-statistic title="Completed" :value="completedCount" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <el-statistic title="Total" :value="total" />
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never">
      <div class="filter-bar">
        <el-select
          v-model="appFilter"
          placeholder="Filter by App"
          clearable
          style="width: 200px"
          @change="loadRules"
        >
          <el-option
            v-for="app in appStore.apps"
            :key="app.app_id"
            :label="app.name"
            :value="app.app_id"
          />
        </el-select>
        <el-select
          v-model="statusFilter"
          placeholder="Filter by Status"
          clearable
          style="width: 160px"
          @change="loadRules"
        >
          <el-option label="Active" value="active" />
          <el-option label="Paused" value="paused" />
          <el-option label="Completed" value="completed" />
        </el-select>
        <el-button :icon="Refresh" @click="loadRules"> Refresh </el-button>
      </div>

      <el-table v-loading="loading" :data="rules" stripe style="width: 100%">
        <el-table-column prop="app_id" label="App" width="150" />
        <el-table-column prop="package_name" label="Package" width="180" />
        <el-table-column prop="target_version" label="Target Version" width="140" />
        <el-table-column prop="strategy" label="Strategy" width="130">
          <template #default="{ row }">
            <el-tag size="small">
              {{ row.strategy }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Status" width="120">
          <template #default="{ row }">
            <StatusBadge :status="row.status" />
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="Created" width="160">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="Rule Preview" min-width="200">
          <template #default="{ row }">
            <code class="rule-preview-code">{{ describeRule(row.rule_config) }}</code>
          </template>
        </el-table-column>
        <el-table-column
          v-if="authStore.hasPermission('operator')"
          label="Actions"
          width="220"
          fixed="right"
        >
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'active'"
              size="small"
              type="warning"
              @click="handlePause(row.id)"
            >
              Pause
            </el-button>
            <el-button
              v-if="row.status === 'paused'"
              size="small"
              type="success"
              @click="handleResume(row.id)"
            >
              Resume
            </el-button>
            <el-button
              v-if="row.status === 'active'"
              size="small"
              type="primary"
              @click="handleComplete(row.id)"
            >
              Complete
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
          @change="loadRules"
        />
      </div>
    </el-card>

    <GrayscaleForm v-model="showForm" @saved="handleSaved" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Plus, Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import {
  listGrayscaleRules,
  pauseGrayscaleRule,
  resumeGrayscaleRule,
  completeGrayscaleRule,
} from '@/api/grayscale'
import StatusBadge from '@/components/StatusBadge.vue'
import GrayscaleForm from './GrayscaleForm.vue'

import type { GrayscaleRule, GrayscaleCondition, CompositeRule } from '@/api/types'

/** Default page size for grayscale rule list */
const DEFAULT_PAGE_SIZE = 20

const appStore = useAppStore()
const authStore = useAuthStore()

const rules = ref<GrayscaleRule[]>([])
const loading = ref(false)
const appFilter = ref('')
const statusFilter = ref('')
const page = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)
const total = ref(0)
const showForm = ref(false)

const activeCount = computed(() => rules.value.filter((r) => r.status === 'active').length)
const pausedCount = computed(() => rules.value.filter((r) => r.status === 'paused').length)
const completedCount = computed(() => rules.value.filter((r) => r.status === 'completed').length)

async function loadRules() {
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

async function handlePause(id: number) {
  await ElMessageBox.confirm('Pause this grayscale rule?', 'Confirm')
  await pauseGrayscaleRule(id)
  ElMessage.success('Rule paused')
  void loadRules()
}

async function handleResume(id: number) {
  await ElMessageBox.confirm('Resume this grayscale rule?', 'Confirm')
  await resumeGrayscaleRule(id)
  ElMessage.success('Rule resumed')
  void loadRules()
}

async function handleComplete(id: number) {
  await ElMessageBox.confirm(
    'Complete this grayscale rule and promote to full release?',
    'Confirm Promotion',
    { type: 'warning' },
  )
  await completeGrayscaleRule(id)
  ElMessage.success('Promoted to full release')
  void loadRules()
}

function handleSaved() {
  showForm.value = false
  void loadRules()
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Describe a rule config as a human-readable string */
function describeRule(rule: GrayscaleCondition | CompositeRule): string {
  if ('operator' in rule) {
    const parts = rule.conditions.map(describeRule)
    return `(${parts.join(` ${rule.operator} `)})`
  }
  if (rule.type === 'user_list') {
    return `users: [${rule.values?.join(', ') ?? ''}]`
  }
  if (rule.type === 'department') {
    return `dept: [${rule.values?.join(', ') ?? ''}]`
  }
  return `${String(rule.value ?? 0)}% traffic`
}

onMounted(loadRules)
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

.stats-row {
  margin-bottom: 16px;
}

.stat-card {
  text-align: center;
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

.rule-preview-code {
  font-size: 12px;
  word-break: break-all;
}
</style>
