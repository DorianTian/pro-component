<script setup lang="ts">
import { ProTable } from '@pro/table'
import type { ProColumnDef } from '@pro/utils'

interface OrderRecord {
  id: number
  orderNo: string
  customer: { name: string; phone: string }
  product: { name: string; category: { label: string } }
  amount: number
}

const columns: ProColumnDef<OrderRecord>[] = [
  { dataIndex: 'orderNo', title: '订单号', valueType: 'text', width: 160 },
  { dataIndex: 'customer.name', title: '客户姓名', valueType: 'text' },
  { dataIndex: 'customer.phone', title: '客户电话', valueType: 'text' },
  { dataIndex: 'product.name', title: '商品名称', valueType: 'text' },
  { dataIndex: 'product.category.label', title: '商品分类', valueType: 'text' },
  { dataIndex: 'amount', title: '金额', valueType: 'money' },
]

const data: OrderRecord[] = [
  {
    id: 1,
    orderNo: 'ORD-2026-0001',
    customer: { name: '陈明远', phone: '13800138001' },
    product: { name: '智能手表 Pro', category: { label: '数码配件' } },
    amount: 2999,
  },
  {
    id: 2,
    orderNo: 'ORD-2026-0002',
    customer: { name: '林思雨', phone: '13800138002' },
    product: { name: '无线降噪耳机', category: { label: '音频设备' } },
    amount: 1599,
  },
  {
    id: 3,
    orderNo: 'ORD-2026-0003',
    customer: { name: '王浩然', phone: '13800138003' },
    product: { name: '机械键盘', category: { label: '外设' } },
    amount: 899,
  },
  {
    id: 4,
    orderNo: 'ORD-2026-0004',
    customer: { name: '赵芷晴', phone: '13800138004' },
    product: { name: '便携显示器', category: { label: '显示设备' } },
    amount: 3499,
  },
]
</script>

<template>
  <ProTable
    :columns="columns"
    :data="data"
    header-title="嵌套数据路径"
    row-key="id"
    :search="false"
    :pagination="false"
  />
</template>
