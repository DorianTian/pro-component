<script setup lang="ts">
import { LightFilter } from '@pro/form'
import { ElMessage } from 'element-plus'

const fields = [
  { dataIndex: 'keyword', title: '关键词', valueType: 'text' as const },
  {
    dataIndex: 'status',
    title: '状态',
    valueType: 'select' as const,
    valueEnum: {
      active: { text: '启用' },
      disabled: { text: '禁用' },
    },
  },
  { dataIndex: 'date', title: '日期', valueType: 'date' as const },
]

function handleChange(values: Record<string, unknown>) {
  ElMessage.info(`筛选条件: ${JSON.stringify(values)}`)
}
</script>

<template>
  <LightFilter :fields="fields" @change="handleChange" />
</template>
