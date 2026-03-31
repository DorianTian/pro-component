<script setup lang="ts">
import { ref } from 'vue'
import { ProTable, useProTable } from '@pro/table'
import type { ProColumnDef, RequestParams, RequestResult } from '@pro/utils'
import { ElButton, ElMessage } from 'element-plus'

interface UserRecord {
  id: number
  name: string
  department: string
  status: string
}

const columns: ProColumnDef<UserRecord>[] = [
  { dataIndex: 'id', title: 'ID', width: 80, hideInSearch: true },
  { dataIndex: 'name', title: '姓名', valueType: 'text' },
  {
    dataIndex: 'department',
    title: '部门',
    valueType: 'select',
    valueEnum: {
      engineering: { text: '工程部' },
      product: { text: '产品部' },
      design: { text: '设计部' },
    },
  },
  {
    dataIndex: 'status',
    title: '状态',
    valueType: 'select',
    valueEnum: {
      active: { text: '在职', status: 'success' },
      resigned: { text: '离职', status: 'danger' },
    },
  },
]

const TOTAL = 20
const DELAY = 400

async function request(params: RequestParams): Promise<RequestResult<UserRecord>> {
  await new Promise((r) => setTimeout(r, DELAY))
  const data = Array.from({ length: TOTAL }, (_, i) => ({
    id: i + 1,
    name: ['张三', '李四', '王五', '赵六'][i % 4],
    department: ['engineering', 'product', 'design'][i % 3],
    status: i % 3 === 0 ? 'resigned' : 'active',
  }))
  const start = (params.current - 1) * params.pageSize
  return { data: data.slice(start, start + params.pageSize), total: TOTAL, success: true }
}

const { proTableProps, selectedRows, selectedRowKeys, clearSelection, deleteRow } = useProTable({
  columns,
  request,
  rowKey: 'id',
  defaultPageSize: 5,
})

function handleBatchDelete() {
  if (selectedRowKeys.value.length === 0) return
  const count = selectedRowKeys.value.length
  for (const key of selectedRowKeys.value) deleteRow(key)
  clearSelection()
  ElMessage.success(`已删除 ${count} 条记录`)
}
</script>

<template>
  <div style="margin-bottom: 16px">
    <ElButton type="danger" :disabled="selectedRows.length === 0" @click="handleBatchDelete">
      批量删除 ({{ selectedRows.length }})
    </ElButton>
    <ElButton @click="clearSelection">清空选择</ElButton>
  </div>
  <ProTable
    v-bind="proTableProps"
    header-title="行选择与批量操作"
    :row-selection="{ type: 'checkbox', crossPageSelect: true }"
  />
</template>
