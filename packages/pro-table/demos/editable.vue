<script setup lang="ts">
import { ref } from 'vue'
import { ProTable } from '@pro/table'
import type { ProColumnDef, EditableConfig } from '@pro/table'
import { ElMessage, ElRadioGroup, ElRadioButton } from 'element-plus'

interface ProductRecord {
  id: number
  name: string
  price: number
  stock: number
  status: string
}

const columns: ProColumnDef<ProductRecord>[] = [
  { dataIndex: 'id', title: 'ID', width: 80, editable: false },
  {
    dataIndex: 'name',
    title: 'Product Name',
    valueType: 'text',
    formItemProps: { rules: [{ required: true, message: 'Name is required' }] },
  },
  { dataIndex: 'price', title: 'Price', valueType: 'money' },
  {
    dataIndex: 'stock',
    title: 'Stock',
    valueType: 'number',
    formItemProps: {
      rules: [{ required: true, message: 'Stock is required' }],
    },
  },
  {
    dataIndex: 'status',
    title: 'Status',
    valueType: 'select',
    valueEnum: {
      on_sale: { text: 'On Sale', status: 'success' },
      off_shelf: { text: 'Off Shelf', status: 'danger' },
    },
  },
]

let idCounter = 4

const data = ref<ProductRecord[]>([
  { id: 1, name: 'MacBook Pro 14"', price: 14999, stock: 120, status: 'on_sale' },
  { id: 2, name: 'iPhone 16 Pro', price: 8999, stock: 350, status: 'on_sale' },
  { id: 3, name: 'AirPods Max', price: 4399, stock: 0, status: 'off_shelf' },
])

const mode = ref<'single' | 'multiple'>('single')

const editableConfig = ref<EditableConfig<ProductRecord>>({
  type: 'single',
  onSave: async (key, row) => {
    await new Promise((r) => setTimeout(r, 500))
    const idx = data.value.findIndex((d) => String(d.id) === key)
    if (idx !== -1) {
      data.value[idx] = { ...data.value[idx], ...row } as ProductRecord
    }
    ElMessage.success('Saved successfully')
    return true
  },
  onDelete: async (key) => {
    data.value = data.value.filter((d) => String(d.id) !== key)
    ElMessage.success('Deleted successfully')
    return true
  },
  onCancel: (_key, _row, _orig, isNewRow) => {
    if (isNewRow) {
      ElMessage.info('New row discarded')
    }
  },
  recordCreatorProps: {
    record: () => ({
      id: idCounter++,
      name: '',
      price: 0,
      stock: 0,
      status: 'on_sale',
    }),
    position: 'bottom',
    creatorButtonText: 'Add Product',
  },
})

function handleModeChange(val: string | number | boolean): void {
  const newMode = val as 'single' | 'multiple'
  mode.value = newMode
  editableConfig.value = { ...editableConfig.value, type: newMode }
}
</script>

<template>
  <div style="margin-bottom: 16px">
    <span style="margin-right: 8px">Edit Mode:</span>
    <ElRadioGroup :model-value="mode" @update:model-value="handleModeChange">
      <ElRadioButton value="single">Single Row</ElRadioButton>
      <ElRadioButton value="multiple">Multiple Rows</ElRadioButton>
    </ElRadioGroup>
  </div>
  <ProTable
    :columns="columns"
    :data="data"
    header-title="Editable Table"
    row-key="id"
    :search="false"
    :pagination="false"
    :editable="editableConfig"
  />
</template>
