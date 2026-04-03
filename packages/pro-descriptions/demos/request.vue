<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ProDescriptions } from '@pro/descriptions'
import { ElButton } from 'element-plus'
import type { ProColumnDef } from '@pro/utils'

const NETWORK_DELAY_MS = 1500

const columns: ProColumnDef[] = [
  { dataIndex: 'orderNo', title: '订单编号', valueType: 'text' },
  { dataIndex: 'customer', title: '客户名称', valueType: 'text' },
  { dataIndex: 'amount', title: '订单金额', valueType: 'money' },
  {
    dataIndex: 'status',
    title: '订单状态',
    valueType: 'select',
    valueEnum: {
      paid: { text: '已支付', status: 'success' },
      pending: { text: '待支付', status: 'warning' },
      refunded: { text: '已退款', status: 'danger' },
    },
  },
  { dataIndex: 'createdAt', title: '下单时间', valueType: 'dateTime' },
  { dataIndex: 'paymentMethod', title: '支付方式', valueType: 'text' },
]

const loading = ref(true)
const data = ref<Record<string, unknown>>({})

async function fetchDetail() {
  loading.value = true
  await new Promise((resolve) => setTimeout(resolve, NETWORK_DELAY_MS))
  data.value = {
    orderNo: 'ORD-20260401-0042',
    customer: '深圳星辰科技有限公司',
    amount: 128900,
    status: 'paid',
    createdAt: '2026-04-01T09:30:00',
    paymentMethod: '企业对公转账',
  }
  loading.value = false
}

onMounted(fetchDetail)
</script>

<template>
  <ElButton style="margin-bottom: 16px" @click="fetchDetail">重新加载</ElButton>
  <ProDescriptions
    title="异步加载详情"
    :columns="columns"
    :data="data"
    :loading="loading"
    :column="2"
    border
  />
</template>
