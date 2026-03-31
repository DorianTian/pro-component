<script setup lang="ts">
import { ProTable } from '@pro/table'
import type { ProColumnDef, RequestParams, RequestResult } from '@pro/utils'

interface EmployeeRecord {
  id: number
  name: string
  department: string
  role: string
  joinDate: string
  salary: number
}

const TOTAL_EMPLOYEES = 50
const NETWORK_DELAY_MS = 600
const SEARCH_LABEL_WIDTH = 80

const columns: ProColumnDef<EmployeeRecord>[] = [
  { dataIndex: 'id', title: 'ID', width: 80, hideInSearch: true },
  {
    dataIndex: 'name',
    title: '姓名',
    valueType: 'text',
    searchConfig: { order: 1, span: 8 },
  },
  {
    dataIndex: 'department',
    title: '部门',
    valueType: 'select',
    valueEnum: {
      engineering: { text: '工程部' },
      product: { text: '产品部' },
      design: { text: '设计部' },
      marketing: { text: '市场部' },
    },
    searchConfig: { order: 2, span: 8 },
  },
  {
    dataIndex: 'role',
    title: '职位',
    valueType: 'text',
    searchConfig: { order: 3, span: 8 },
  },
  {
    dataIndex: 'joinDate',
    title: '入职日期',
    valueType: 'date',
    searchConfig: { order: 4, span: 8 },
  },
  {
    dataIndex: 'salary',
    title: '薪资',
    valueType: 'money',
    hideInSearch: true,
  },
]

async function request(params: RequestParams): Promise<RequestResult<EmployeeRecord>> {
  await new Promise((resolve) => setTimeout(resolve, NETWORK_DELAY_MS))
  const allData: EmployeeRecord[] = Array.from({ length: TOTAL_EMPLOYEES }, (_, i) => ({
    id: i + 1,
    name: ['张三', '李四', '王五', '赵六', '钱七'][i % 5],
    department: ['engineering', 'product', 'design', 'marketing'][i % 4],
    role: ['前端工程师', '后端工程师', '产品经理', 'UI 设计师'][i % 4],
    joinDate: new Date(2023, i % 12, 1 + (i % 28)).toISOString().split('T')[0],
    salary: 15000 + Math.floor(Math.random() * 30000),
  }))

  let filtered = allData
  if (params.name) filtered = filtered.filter((r) => r.name.includes(String(params.name)))
  if (params.department) filtered = filtered.filter((r) => r.department === params.department)
  if (params.role) filtered = filtered.filter((r) => r.role.includes(String(params.role)))

  const start = (params.current - 1) * params.pageSize
  return {
    data: filtered.slice(start, start + params.pageSize),
    total: filtered.length,
    success: true,
  }
}
</script>

<template>
  <ProTable
    :columns="columns"
    :request="request"
    header-title="搜索表单"
    row-key="id"
    :search="{ labelWidth: SEARCH_LABEL_WIDTH, defaultCollapsed: false }"
  />
</template>
