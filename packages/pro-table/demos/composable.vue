<script setup lang="ts">
import { ProTable, useProTable } from '@pro/table'
import type { ProColumnDef, RequestParams, RequestResult } from '@pro/utils'
import { ElButton, ElMessage } from 'element-plus'

interface OrderRecord {
  id: string
  product: string
  amount: number
  status: string
}

const columns: ProColumnDef<OrderRecord>[] = [
  { dataIndex: 'id', title: '订单号', valueType: 'text' },
  { dataIndex: 'product', title: '商品', valueType: 'text' },
  { dataIndex: 'amount', title: '金额', valueType: 'money' },
  {
    dataIndex: 'status',
    title: '状态',
    valueType: 'select',
    valueEnum: {
      pending: { text: '待支付', status: 'warning' },
      paid: { text: '已支付', status: 'success' },
      cancelled: { text: '已取消', status: 'danger' },
    },
  },
]

const TOTAL_ORDERS = 30
const NETWORK_DELAY_MS = 500
const DEFAULT_PAGE_SIZE = 5

async function request(params: RequestParams): Promise<RequestResult<OrderRecord>> {
  await new Promise((resolve) => setTimeout(resolve, NETWORK_DELAY_MS))
  const data: OrderRecord[] = Array.from({ length: TOTAL_ORDERS }, (_, i) => ({
    id: `ORD-${String(i + 1).padStart(6, '0')}`,
    product: `商品 ${i + 1}`,
    amount: Math.floor(Math.random() * 10000) / 100,
    status: ['pending', 'paid', 'cancelled'][i % 3],
  }))
  const start = (params.current - 1) * params.pageSize
  return {
    data: data.slice(start, start + params.pageSize),
    total: data.length,
    success: true,
  }
}

const { proTableProps, selectedRows, selectedRowKeys, clearSelection, reload, deleteRow } =
  useProTable({
    columns,
    request,
    rowKey: 'id',
    defaultPageSize: DEFAULT_PAGE_SIZE,
  })

function handleBatchDelete() {
  if (selectedRowKeys.value.length === 0) {
    ElMessage.warning('请先选择要删除的订单')
    return
  }
  const count = selectedRowKeys.value.length
  for (const key of selectedRowKeys.value) {
    deleteRow(key)
  }
  clearSelection()
  ElMessage.success(`已删除 ${count} 条订单`)
}
</script>

<template>
  <div style="margin-bottom: 16px">
    <ElButton type="primary" @click="reload(true)">刷新数据</ElButton>
    <ElButton type="danger" :disabled="selectedRows.length === 0" @click="handleBatchDelete">
      批量删除 ({{ selectedRows.length }})
    </ElButton>
  </div>

  <ProTable
    v-bind="proTableProps"
    header-title="Composable 受控模式"
    :row-selection="{ type: 'checkbox' }"
  />
</template>
