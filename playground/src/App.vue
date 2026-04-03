<script setup lang="ts">
import { h, ref } from 'vue'
import { ElTag } from 'element-plus'
import type { ProColumnDef } from '@pro/utils'
import type { RequestParams, RequestResult } from '@pro/utils'
// ── ProTable mock data ──────────────────────────────────────────────
const mockData = [
  {
    id: '1',
    name: 'Alice Chen',
    age: 28,
    status: 'active',
    role: 'admin',
    salary: 15000,
    joinDate: '2024-03-15T10:30:00Z',
  },
  {
    id: '2',
    name: 'Bob Zhang',
    age: 34,
    status: 'inactive',
    role: 'viewer',
    salary: 12000,
    joinDate: '2024-06-20T14:00:00Z',
  },
  {
    id: '3',
    name: 'Charlie Li',
    age: 22,
    status: 'active',
    role: 'publisher',
    salary: 18000,
    joinDate: '2025-01-10T09:15:00Z',
  },
  {
    id: '4',
    name: 'Diana Wang',
    age: 31,
    status: 'active',
    role: 'operator',
    salary: 22000,
    joinDate: '2023-11-05T16:45:00Z',
  },
  {
    id: '5',
    name: 'Eric Liu',
    age: 27,
    status: 'inactive',
    role: 'viewer',
    salary: 9500,
    joinDate: '2025-02-28T11:00:00Z',
  },
]

const showDialog = ref(false)

const columns: ProColumnDef[] = [
  { title: 'Name', dataIndex: 'name', key: 'name', valueType: 'text', minWidth: 140 },
  {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
    valueType: 'digit',
    sortable: true,
    hideInSearch: true,
    width: 100,
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    valueType: 'text',
    valueEnum: {
      active: { text: 'Active', status: 'success' },
      inactive: { text: 'Inactive', status: 'danger' },
    },
    width: 120,
    render: (row: Record<string, unknown>) => {
      const s = row.status as string
      return h(
        ElTag,
        { type: s === 'active' ? 'success' : 'danger', size: 'small', effect: 'light' },
        () => (s === 'active' ? 'Active' : 'Inactive'),
      )
    },
  },
  {
    title: 'Role',
    dataIndex: 'role',
    key: 'role',
    valueType: 'text',
    width: 120,
    valueEnum: {
      admin: { text: 'Admin' },
      operator: { text: 'Operator' },
      publisher: { text: 'Publisher' },
      viewer: { text: 'Viewer' },
    },
  },
  {
    title: 'Salary',
    dataIndex: 'salary',
    key: 'salary',
    valueType: 'money',
    sortable: true,
    hideInSearch: true,
    width: 140,
  },
  {
    title: 'Join Date',
    dataIndex: 'joinDate',
    key: 'joinDate',
    valueType: 'dateTime',
    hideInSearch: true,
    minWidth: 160,
  },
]

async function fetchUsers(params: RequestParams): Promise<RequestResult> {
  await new Promise((r) => setTimeout(r, 500))
  let filtered = [...mockData]
  if (params.name) {
    const kw = String(params.name).toLowerCase()
    filtered = filtered.filter((d) => d.name.toLowerCase().includes(kw))
  }
  if (params.status) filtered = filtered.filter((d) => d.status === params.status)
  if (params.role) filtered = filtered.filter((d) => d.role === params.role)
  const start = ((params.current ?? 1) - 1) * (params.pageSize ?? 20)
  return {
    data: filtered.slice(start, start + (params.pageSize ?? 20)),
    total: filtered.length,
    success: true,
  }
}

// ── ProTree mock data ───────────────────────────────────────────────
const treeData = [
  {
    id: 'engineering',
    label: 'Engineering',
    children: [
      { id: 'frontend', label: 'Frontend Team' },
      { id: 'backend', label: 'Backend Team' },
      { id: 'infra', label: 'Infrastructure' },
    ],
  },
  {
    id: 'design',
    label: 'Design',
    children: [
      { id: 'ux', label: 'UX Research' },
      { id: 'ui', label: 'UI Design' },
    ],
  },
  {
    id: 'product',
    label: 'Product',
    children: [
      { id: 'pm', label: 'Product Management' },
      { id: 'analytics', label: 'Data Analytics' },
      { id: 'growth', label: 'Growth' },
    ],
  },
]

// ── ProTabs state ───────────────────────────────────────────────────
const activeTab = ref('overview')
const tabList = ref([
  { name: 'overview', label: 'Overview' },
  { name: 'analytics', label: 'Analytics' },
  { name: 'settings', label: 'Settings' },
  { name: 'logs', label: 'Logs' },
])

function handleTabRemove(name: string) {
  const idx = tabList.value.findIndex((t) => t.name === name)
  if (idx === -1) return
  tabList.value.splice(idx, 1)
  if (activeTab.value === name) {
    activeTab.value = tabList.value[Math.min(idx, tabList.value.length - 1)]?.name ?? ''
  }
}

// ── ProLoading state ────────────────────────────────────────────────
const loadingState = ref<'loading' | 'empty' | 'error' | 'success'>('success')

function setLoadingState(state: 'loading' | 'empty' | 'error' | 'success') {
  loadingState.value = state
}

// ── Base Components state ───────────────────────────────────────────
const inputValue = ref('')
const selectValue = ref('')
const dateValue = ref('')
const baseDialogVisible = ref(false)
const paginationPage = ref(1)
const paginationSize = ref(20)

// ── Pagination Playground state ────────────────────────────────────
const pgPage = ref(1)
const pgSize = ref(20)
const pgTotal = ref(500)
const pgAutoHide = ref(false)
const pgCompact = ref(false)
const pgShowTotal = ref(true)
const pgShowSizeChanger = ref(true)
const pgShowQuickJumper = ref(true)
const pgBackground = ref(false)
const pgDisabled = ref(false)
const pgUseFormatter = ref(false)

function pgTotalFormatter(total: number, range: [number, number]): string {
  return `Showing ${range[0]}-${range[1]} of ${total} records`
}
</script>

<template>
  <ProConfigProvider density="default" theme="light">
    <div class="app">
      <header class="app-header">
        <h1>Pro Components</h1>
        <span class="app-header__sub">Playground</span>
      </header>

      <main class="app-content">
        <!-- Primary demo: in a card -->
        <div class="card">
          <ProTable
            :columns="columns"
            :request="fetchUsers"
            row-key="id"
            header-title="User Management"
            :pagination="{ defaultPageSize: 3 }"
            :row-selection="{ crossPageSelect: true }"
          />
        </div>

        <!-- Embedded mode demos -->
        <h2 class="section-title">Embedded Scenarios</h2>

        <el-tabs type="border-card">
          <el-tab-pane label="In el-card">
            <el-card shadow="hover">
              <ProTable
                :columns="columns"
                :data="mockData"
                row-key="id"
                header-title="Inside el-card"
                :search="false"
                :pagination="false"
              />
            </el-card>
          </el-tab-pane>

          <el-tab-pane label="In el-dialog">
            <el-button type="primary" @click="showDialog = true">Open Dialog</el-button>
            <el-dialog v-model="showDialog" title="Table in Dialog" width="900px">
              <ProTable
                :columns="columns"
                :data="mockData"
                row-key="id"
                header-title="Inside el-dialog"
                :search="false"
                :pagination="false"
              />
            </el-dialog>
          </el-tab-pane>

          <el-tab-pane label="Compact density">
            <ProTable
              :columns="columns"
              :data="mockData"
              row-key="id"
              header-title="Compact Mode"
              :search="false"
              :pagination="false"
              :table-props="{ size: 'small' }"
            />
          </el-tab-pane>
        </el-tabs>

        <!-- ── ProTree ─────────────────────────────────────────────── -->
        <h2 class="section-title">ProTree</h2>
        <div class="card" style="max-width: 400px">
          <ProTree
            :data="treeData"
            searchable
            :default-expand-all="true"
            highlight-current
            search-placeholder="Search departments..."
          />
        </div>

        <!-- ── ProTabs ─────────────────────────────────────────────── -->
        <h2 class="section-title">ProTabs</h2>
        <div class="card" style="padding: var(--pro-space-5)">
          <ProTabs v-model="activeTab" variant="card" closable @tab-remove="handleTabRemove">
            <ProTabPane v-for="tab in tabList" :key="tab.name" :label="tab.label" :name="tab.name">
              <div style="padding: var(--pro-space-5); color: var(--pro-text-secondary)">
                Content for {{ tab.label }} tab
              </div>
            </ProTabPane>
          </ProTabs>
        </div>

        <!-- ── ProTag ──────────────────────────────────────────────── -->
        <h2 class="section-title">ProTag</h2>
        <div class="card" style="padding: var(--pro-space-5)">
          <div style="display: flex; gap: var(--pro-space-3); flex-wrap: wrap; align-items: center">
            <ProTag status="success">Success</ProTag>
            <ProTag status="warning">Warning</ProTag>
            <ProTag status="error">Error</ProTag>
            <ProTag status="processing">Processing</ProTag>
            <ProTag status="info">Info</ProTag>
            <ProTag status="default">Default</ProTag>
          </div>
        </div>

        <!-- ── ProEmpty ────────────────────────────────────────────── -->
        <h2 class="section-title">ProEmpty</h2>
        <div class="demo-grid">
          <div class="card">
            <ProEmpty type="no-data" />
          </div>
          <div class="card">
            <ProEmpty type="no-result" />
          </div>
          <div class="card">
            <ProEmpty type="error" />
          </div>
          <div class="card">
            <ProEmpty type="no-permission" />
          </div>
        </div>

        <!-- ── ProResult ───────────────────────────────────────────── -->
        <h2 class="section-title">ProResult</h2>
        <div class="demo-grid demo-grid--2col">
          <div class="card">
            <ProResult
              type="success"
              title="Payment Completed"
              sub-title="Order #2024-0331 has been processed."
            >
              <template #extra>
                <el-button type="primary" size="small">View Order</el-button>
                <el-button size="small">Back to List</el-button>
              </template>
            </ProResult>
          </div>
          <div class="card">
            <ProResult type="404">
              <template #extra>
                <el-button type="primary" size="small">Go Home</el-button>
              </template>
            </ProResult>
          </div>
        </div>

        <!-- ── ProLoading ──────────────────────────────────────────── -->
        <h2 class="section-title">ProLoading</h2>
        <div class="card" style="padding: var(--pro-space-5)">
          <div style="display: flex; gap: var(--pro-space-3); margin-bottom: var(--pro-space-5)">
            <el-button
              :type="loadingState === 'success' ? 'primary' : 'default'"
              size="small"
              @click="setLoadingState('success')"
              >Success</el-button
            >
            <el-button
              :type="loadingState === 'loading' ? 'primary' : 'default'"
              size="small"
              @click="setLoadingState('loading')"
              >Loading</el-button
            >
            <el-button
              :type="loadingState === 'empty' ? 'primary' : 'default'"
              size="small"
              @click="setLoadingState('empty')"
              >Empty</el-button
            >
            <el-button
              :type="loadingState === 'error' ? 'primary' : 'default'"
              size="small"
              @click="setLoadingState('error')"
              >Error</el-button
            >
          </div>
          <ProLoading
            :loading="loadingState === 'loading'"
            :empty="loadingState === 'empty'"
            :error="
              loadingState === 'error'
                ? 'Network request failed — please check your connection.'
                : null
            "
            @retry="setLoadingState('loading')"
          >
            <div
              style="
                padding: var(--pro-space-5);
                color: var(--pro-text-secondary);
                text-align: center;
              "
            >
              Data loaded successfully. This is the content area.
            </div>
          </ProLoading>
        </div>

        <!-- ── Base Components Quick Demo ──────────────────────────── -->
        <h2 class="section-title">Base Components</h2>
        <div class="card" style="padding: var(--pro-space-5)">
          <p class="demo-hint">
            Enterprise defaults applied: Input (clearable), Select (clearable + filterable),
            DatePicker (clearable + YYYY-MM-DD format), Dialog (draggable + appendToBody),
            Pagination (full layout with sizes/jumper).
          </p>
          <div class="base-demo-row">
            <div class="base-demo-item">
              <label class="base-demo-label">Input</label>
              <Input v-model="inputValue" placeholder="Clearable by default" />
            </div>
            <div class="base-demo-item">
              <label class="base-demo-label">Select</label>
              <Select v-model="selectValue" placeholder="Filterable by default">
                <el-option label="Option A" value="a" />
                <el-option label="Option B" value="b" />
                <el-option label="Option C" value="c" />
              </Select>
            </div>
            <div class="base-demo-item">
              <label class="base-demo-label">DatePicker</label>
              <DatePicker v-model="dateValue" placeholder="YYYY-MM-DD format" />
            </div>
          </div>
          <div class="base-demo-row" style="margin-top: var(--pro-space-5)">
            <div class="base-demo-item">
              <label class="base-demo-label">Dialog</label>
              <el-button size="small" @click="baseDialogVisible = true"
                >Open Draggable Dialog</el-button
              >
              <Dialog v-model="baseDialogVisible" title="Draggable Dialog" width="500px">
                <p style="color: var(--pro-text-secondary)">
                  This dialog is draggable and appended to body by default.
                </p>
              </Dialog>
            </div>
            <div class="base-demo-item" style="flex: 2">
              <label class="base-demo-label">Pagination</label>
              <Pagination v-model:current-page="paginationPage" :page-size="20" :total="200" />
            </div>
          </div>
        </div>
        <!-- ── Pagination Playground ────────────────────────────────── -->
        <h2 class="section-title">Pagination Playground</h2>
        <div class="card" style="padding: var(--pro-space-5)">
          <!-- Controls -->
          <div class="pg-controls">
            <div class="pg-controls__row">
              <label class="pg-controls__label">total</label>
              <el-input-number v-model="pgTotal" :min="0" :max="10000" :step="50" size="small" />
            </div>
            <div class="pg-controls__row">
              <el-checkbox v-model="pgAutoHide">autoHide</el-checkbox>
              <el-checkbox v-model="pgCompact">compact</el-checkbox>
              <el-checkbox v-model="pgBackground">background</el-checkbox>
              <el-checkbox v-model="pgDisabled">disabled</el-checkbox>
            </div>
            <div class="pg-controls__row">
              <el-checkbox v-model="pgShowTotal">showTotal</el-checkbox>
              <el-checkbox v-model="pgShowSizeChanger">showSizeChanger</el-checkbox>
              <el-checkbox v-model="pgShowQuickJumper">showQuickJumper</el-checkbox>
              <el-checkbox v-model="pgUseFormatter">totalFormatter</el-checkbox>
            </div>
          </div>

          <!-- Live preview -->
          <div class="pg-preview">
            <Pagination
              v-model:current-page="pgPage"
              v-model:page-size="pgSize"
              :total="pgTotal"
              :auto-hide="pgAutoHide"
              :compact="pgCompact"
              :background="pgBackground"
              :disabled="pgDisabled"
              :show-total="pgShowTotal"
              :show-size-changer="pgShowSizeChanger"
              :show-quick-jumper="pgShowQuickJumper"
              :total-formatter="pgUseFormatter ? pgTotalFormatter : undefined"
            />
          </div>

          <!-- State readout -->
          <div class="pg-state">
            page={{ pgPage }}, pageSize={{ pgSize }}, total={{ pgTotal }}
          </div>
        </div>
      </main>
    </div>
  </ProConfigProvider>
</template>

<style>
body {
  margin: 0;
  font-family: var(--pro-font-family);
  background: var(--pro-bg-base);
  color: var(--pro-text-primary);
  -webkit-font-smoothing: antialiased;
}

.app-header {
  display: flex;
  align-items: baseline;
  gap: var(--pro-space-4);
  padding: var(--pro-space-5) var(--pro-space-7);
  background: var(--pro-bg-elevated);
  border-bottom: 1px solid var(--pro-border-light);
}
.app-header h1 {
  margin: 0;
  font-size: var(--pro-text-lg);
  font-weight: var(--pro-font-weight-bold);
}
.app-header__sub {
  font-size: var(--pro-text-sm);
  color: var(--pro-text-tertiary);
}

.app-content {
  padding: var(--pro-space-6) var(--pro-space-7);
  max-width: 1400px;
  margin: 0 auto;
}

.card {
  background: var(--pro-bg-elevated);
  border-radius: var(--pro-radius-lg);
  border: 1px solid var(--pro-border-light);
  box-shadow: var(--pro-shadow-sm);
  overflow: hidden;
}

.section-title {
  margin: var(--pro-space-7) 0 var(--pro-space-4);
  font-size: var(--pro-text-lg);
  font-weight: var(--pro-font-weight-semibold);
  color: var(--pro-text-primary);
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--pro-space-4);
}

.demo-grid--2col {
  grid-template-columns: repeat(2, 1fr);
}

.demo-hint {
  margin: 0 0 var(--pro-space-5);
  font-size: var(--pro-text-sm);
  color: var(--pro-text-tertiary);
  line-height: var(--pro-line-height-relaxed);
}

.base-demo-row {
  display: flex;
  gap: var(--pro-space-5);
  align-items: flex-start;
}

.base-demo-item {
  flex: 1;
  min-width: 0;
}

.base-demo-label {
  display: block;
  margin-bottom: var(--pro-space-2);
  font-size: var(--pro-text-sm);
  font-weight: var(--pro-font-weight-medium);
  color: var(--pro-text-secondary);
}

/* Pagination playground */
.pg-controls {
  display: flex;
  flex-direction: column;
  gap: var(--pro-space-3);
  padding-bottom: var(--pro-space-5);
  border-bottom: 1px solid var(--pro-border-light);
  margin-bottom: var(--pro-space-5);
}

.pg-controls__row {
  display: flex;
  align-items: center;
  gap: var(--pro-space-4);
}

.pg-controls__label {
  font-size: var(--pro-text-sm);
  color: var(--pro-text-secondary);
  min-width: 40px;
}

.pg-preview {
  padding: var(--pro-space-5) 0;
  min-height: 48px;
  display: flex;
  align-items: center;
}

.pg-state {
  padding-top: var(--pro-space-3);
  border-top: 1px solid var(--pro-border-light);
  font-size: 13px;
  font-family: monospace;
  color: var(--pro-text-tertiary);
}
</style>
