<script setup lang="ts">
import { h, ref } from 'vue'
import { ElTag } from 'element-plus'
import type { ProColumnDef } from '@pro/utils'
import type { RequestParams, RequestResult } from '@pro/utils'

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
</script>

<template>
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
    </main>
  </div>
</template>

<style>
body {
  margin: 0;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: var(--el-bg-color-page, #f0f2f5);
  color: var(--el-text-color-primary, #303133);
  -webkit-font-smoothing: antialiased;
}

.app-header {
  display: flex;
  align-items: baseline;
  gap: 12px;
  padding: 16px 24px;
  background: var(--el-bg-color, #fff);
  border-bottom: 1px solid var(--el-border-color-lighter, #e8e8e8);
}
.app-header h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}
.app-header__sub {
  font-size: 13px;
  color: var(--el-text-color-secondary, #909399);
}

.app-content {
  padding: 20px 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.card {
  background: var(--el-bg-color, #fff);
  border-radius: var(--el-border-radius-base, 4px);
  padding: 0 20px 16px;
  border: 1px solid var(--el-border-color-lighter, #ebeef5);
}

.section-title {
  margin: 24px 0 12px;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary, #303133);
}
</style>
