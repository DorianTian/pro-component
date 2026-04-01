<script setup lang="ts">
import { ref } from 'vue'
import { ProTable } from '@pro/table'
import type { ProColumnDef } from '@pro/utils'
import { ElMessage } from 'element-plus'

interface ProductRecord {
  id: number
  name: string
  price: number
  stock: number
  status: string
}

const columns: ProColumnDef<ProductRecord>[] = [
  { dataIndex: 'id', title: 'ID', width: 80 },
  { dataIndex: 'name', title: '商品名称', valueType: 'text' },
  { dataIndex: 'price', title: '价格', valueType: 'money' },
  { dataIndex: 'stock', title: '库存', valueType: 'number' },
  {
    dataIndex: 'status',
    title: '状态',
    valueType: 'select',
    valueEnum: {
      on_sale: { text: '在售', status: 'success' },
      off_shelf: { text: '下架', status: 'danger' },
    },
  },
]

const data = ref<ProductRecord[]>([
  { id: 1, name: 'MacBook Pro 14"', price: 14999, stock: 120, status: 'on_sale' },
  { id: 2, name: 'iPhone 16 Pro', price: 8999, stock: 350, status: 'on_sale' },
  { id: 3, name: 'AirPods Max', price: 4399, stock: 0, status: 'off_shelf' },
])

async function handleSave(key: string, row: Record<string, unknown>) {
  await new Promise((r) => setTimeout(r, 500))
  const idx = data.value.findIndex((d) => String(d.id) === key)
  if (idx !== -1) data.value[idx] = { ...data.value[idx], ...row }
  ElMessage.success('保存成功')
  return true
}

async function handleDelete(key: string) {
  data.value = data.value.filter((d) => String(d.id) !== key)
  ElMessage.success('删除成功')
  return true
}
</script>

<template>
  <ProTable
    :columns="columns"
    :data="data"
    header-title="可编辑表格"
    row-key="id"
    :search="false"
    :pagination="false"
    :editable="{ onSave: handleSave, onDelete: handleDelete }"
  />
</template>
