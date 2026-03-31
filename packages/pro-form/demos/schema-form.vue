<script setup lang="ts">
import { SchemaForm } from '@pro/form'
import { ElMessage } from 'element-plus'
import type { ProColumnDef } from '@pro/utils'

const columns: ProColumnDef[] = [
  {
    dataIndex: 'name',
    title: '姓名',
    valueType: 'text',
    searchConfig: { rules: [{ required: true, message: '请输入姓名' }] },
  },
  { dataIndex: 'age', title: '年龄', valueType: 'number', hideInSearch: true },
  {
    dataIndex: 'department',
    title: '部门',
    valueType: 'select',
    valueEnum: {
      eng: { text: '工程部' },
      pm: { text: '产品部' },
    },
  },
  { dataIndex: 'joinDate', title: '入职日期', valueType: 'date' },
]

async function handleSubmit(values: Record<string, unknown>) {
  await new Promise((r) => setTimeout(r, 800))
  ElMessage.success(`提交: ${JSON.stringify(values)}`)
  return true
}
</script>

<template>
  <SchemaForm :columns="columns" :on-submit="handleSubmit" layout="vertical" />
</template>
