<script setup lang="ts">
import { ref } from 'vue'
import { ProTable } from '@pro/table'
import type { ProColumnDef, RequestParams, RequestResult } from '@pro/utils'

interface SalesRecord {
  id: number
  product: string
  sales: number
  revenue: number
  growthRate: number
}

const TOTAL_RECORDS = 30
const NETWORK_DELAY_MS = 500

const columns: ProColumnDef<SalesRecord>[] = [
  { dataIndex: 'id', title: 'ID', width: 80, hideInSearch: true },
  { dataIndex: 'product', title: '商品名称', valueType: 'text' },
  { dataIndex: 'sales', title: '销量', valueType: 'number', sortable: 'custom' },
  { dataIndex: 'revenue', title: '营收', valueType: 'money', sortable: 'custom' },
  { dataIndex: 'growthRate', title: '增长率', valueType: 'percent', sortable: true },
]

const sortInfo = ref<{ prop: string; order: string } | null>(null)

async function request(params: RequestParams): Promise<RequestResult<SalesRecord>> {
  await new Promise((resolve) => setTimeout(resolve, NETWORK_DELAY_MS))

  const products = ['蓝牙耳机', '机械键盘', '显示器', '移动电源', '智能手表']
  const allData: SalesRecord[] = Array.from({ length: TOTAL_RECORDS }, (_, i) => ({
    id: i + 1,
    product: products[i % 5],
    sales: 100 + Math.floor(Math.random() * 9900),
    revenue: 5000 + Math.floor(Math.random() * 95000),
    growthRate: Math.floor(Math.random() * 100),
  }))

  let sorted = [...allData]
  if (params.sortField && params.sortOrder) {
    const field = params.sortField as keyof SalesRecord
    const isAsc = params.sortOrder === 'ascending'
    sorted.sort((a, b) => {
      const va = Number(a[field])
      const vb = Number(b[field])
      return isAsc ? va - vb : vb - va
    })
  }

  const start = (params.current - 1) * params.pageSize
  return {
    data: sorted.slice(start, start + params.pageSize),
    total: sorted.length,
    success: true,
  }
}

function handleSortChange(state: { prop: string; order: string } | null) {
  sortInfo.value = state
}
</script>

<template>
  <div style="margin-bottom: 12px; color: #666; font-size: 13px">
    当前排序：{{ sortInfo ? `${sortInfo.prop} ${sortInfo.order}` : '无' }}
  </div>
  <ProTable
    :columns="columns"
    :request="request"
    header-title="列排序"
    row-key="id"
    :search="false"
    @sort-change="handleSortChange"
  />
</template>
