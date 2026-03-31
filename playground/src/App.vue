<script setup lang="ts">
import { ref, h } from 'vue'
import { ElTag } from 'element-plus'
import type { ProColumnDef } from '@pro/utils'
import type { RequestParams, RequestResult } from '@pro/utils'

/**
 * ProTable demo — showcases features beyond raw el-table:
 * - Schema-driven columns (valueType, valueEnum, search, sort)
 * - Built-in request mode with loading/pagination
 * - Toolbar (density, column settings, reload)
 * - Search form auto-generated from column config
 */

const mockData = [
  { id: '1', name: 'Alice Chen', age: 28, status: 'active', role: 'admin', salary: 15000, joinDate: '2024-03-15T10:30:00Z' },
  { id: '2', name: 'Bob Zhang', age: 34, status: 'inactive', role: 'viewer', salary: 12000, joinDate: '2024-06-20T14:00:00Z' },
  { id: '3', name: 'Charlie Li', age: 22, status: 'active', role: 'publisher', salary: 18000, joinDate: '2025-01-10T09:15:00Z' },
  { id: '4', name: 'Diana Wang', age: 31, status: 'active', role: 'operator', salary: 22000, joinDate: '2023-11-05T16:45:00Z' },
  { id: '5', name: 'Eric Liu', age: 27, status: 'inactive', role: 'viewer', salary: 9500, joinDate: '2025-02-28T11:00:00Z' },
]

const columns: ProColumnDef[] = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    valueType: 'text',
    search: true,
  },
  {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
    valueType: 'digit',
    sortable: true,
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    valueType: 'text',
    search: true,
    valueEnum: {
      active: { text: 'Active', status: 'success' },
      inactive: { text: 'Inactive', status: 'danger' },
    },
    render: (row: Record<string, unknown>) => {
      const status = row.status as string
      return h(ElTag, { type: status === 'active' ? 'success' : 'danger', size: 'small' }, () => status === 'active' ? 'Active' : 'Inactive')
    },
  },
  {
    title: 'Role',
    dataIndex: 'role',
    key: 'role',
    valueType: 'text',
    search: true,
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
  },
  {
    title: 'Join Date',
    dataIndex: 'joinDate',
    key: 'joinDate',
    valueType: 'dateTime',
  },
]

/** Simulate an API request with server-side pagination + search */
async function fetchUsers(params: RequestParams): Promise<RequestResult> {
  // Simulate network delay
  await new Promise((r) => setTimeout(r, 600))

  let filtered = [...mockData]

  // Server-side search filtering
  if (params.name) {
    const keyword = String(params.name).toLowerCase()
    filtered = filtered.filter((d) => d.name.toLowerCase().includes(keyword))
  }
  if (params.status) {
    filtered = filtered.filter((d) => d.status === params.status)
  }
  if (params.role) {
    filtered = filtered.filter((d) => d.role === params.role)
  }

  const start = ((params.current ?? 1) - 1) * (params.pageSize ?? 20)
  const paged = filtered.slice(start, start + (params.pageSize ?? 20))

  return { data: paged, total: filtered.length, success: true }
}

// --- Controlled mode (static data, like raw el-table) ---
const staticData = ref(mockData.slice(0, 3))
const staticColumns: ProColumnDef[] = [
  { title: 'Name', dataIndex: 'name', key: 'name', valueType: 'text' },
  { title: 'Age', dataIndex: 'age', key: 'age', valueType: 'digit' },
  { title: 'Status', dataIndex: 'status', key: 'status', valueType: 'text' },
]
</script>

<template>
  <div style="padding: 24px; max-width: 1200px; margin: 0 auto">
    <h1 style="margin-bottom: 8px">Pro Components Playground</h1>
    <p style="color: #666; margin-bottom: 32px">Comparing ProTable features vs raw el-table</p>

    <!-- ProTable: Request Mode with all features -->
    <div style="background: #fff; padding: 24px; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,.08); margin-bottom: 32px">
      <h2 style="margin: 0 0 16px">ProTable — Request Mode</h2>
      <p style="color: #999; font-size: 13px; margin-bottom: 16px">
        Auto search form from column config · request with loading/pagination · toolbar · column settings · valueType formatting · valueEnum tags
      </p>
      <ProTable
        :columns="columns"
        :request="fetchUsers"
        row-key="id"
        header-title="User Management"
        :pagination="{ defaultPageSize: 3 }"
        :row-selection="{ crossPageSelect: true }"
      />
    </div>

    <!-- Raw el-table for comparison -->
    <div style="background: #fff; padding: 24px; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,.08)">
      <h2 style="margin: 0 0 16px">Raw el-table</h2>
      <p style="color: #999; font-size: 13px; margin-bottom: 16px">
        Same data, no search · no pagination · no toolbar · manual everything
      </p>
      <el-table :data="staticData" style="width: 100%">
        <el-table-column prop="name" label="Name" />
        <el-table-column prop="age" label="Age" />
        <el-table-column prop="status" label="Status" />
      </el-table>
    </div>
  </div>
</template>
