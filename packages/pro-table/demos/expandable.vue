<script setup lang="ts">
import { ProTable } from '@pro/table'
import type { ProColumnDef } from '@pro/utils'

interface OrderRecord {
  id: number
  orderNo: string
  customer: string
  amount: number
  status: string
  items: string
  remark: string
}

const columns: ProColumnDef<OrderRecord>[] = [
  { dataIndex: 'orderNo', title: '订单号', valueType: 'text', width: 160 },
  { dataIndex: 'customer', title: '客户', valueType: 'text' },
  { dataIndex: 'amount', title: '金额', valueType: 'money' },
  {
    dataIndex: 'status',
    title: '状态',
    valueType: 'select',
    valueEnum: {
      pending: { text: '待发货', status: 'warning' },
      shipped: { text: '已发货', status: 'success' },
      completed: { text: '已完成', status: 'info' },
    },
  },
]

const data: OrderRecord[] = [
  {
    id: 1,
    orderNo: 'ORD-20260401-001',
    customer: '陈明远',
    amount: 12999,
    status: 'shipped',
    items: 'MacBook Pro 14" × 1',
    remark: '加急配送，请当天发货',
  },
  {
    id: 2,
    orderNo: 'ORD-20260401-002',
    customer: '林思雨',
    amount: 5698,
    status: 'pending',
    items: 'AirPods Max × 1, iPhone 手机壳 × 2',
    remark: '发票抬头：XX科技有限公司',
  },
  {
    id: 3,
    orderNo: 'ORD-20260401-003',
    customer: '王浩然',
    amount: 899,
    status: 'completed',
    items: '机械键盘 × 1',
    remark: '',
  },
]
</script>

<template>
  <ProTable
    :columns="columns"
    :data="data"
    header-title="可展开行"
    row-key="id"
    :search="false"
    :pagination="false"
    :table-props="{ rowKey: 'id' }"
  >
    <template #action>
      <el-table-column type="expand">
        <template #default="{ row }">
          <div style="padding: 12px 48px">
            <p style="margin: 0 0 8px"><strong>商品明细：</strong>{{ row.items }}</p>
            <p v-if="row.remark" style="margin: 0"><strong>备注：</strong>{{ row.remark }}</p>
            <p v-else style="margin: 0; color: #999"><strong>备注：</strong>无</p>
          </div>
        </template>
      </el-table-column>
    </template>
  </ProTable>
</template>
