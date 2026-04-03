<script setup lang="ts">
import { ModalForm } from '@pro/form'
import { ElMessage } from 'element-plus'

import type { ProFormItem } from '@pro/utils'

const fields: ProFormItem[] = [
  {
    dataIndex: 'taskName',
    title: '任务名称',
    valueType: 'text',
    rules: [{ required: true, message: '请输入任务名称' }],
  },
  {
    dataIndex: 'priority',
    title: '优先级',
    valueType: 'select',
    valueEnum: {
      high: { text: '高', status: 'danger' },
      medium: { text: '中', status: 'warning' },
      low: { text: '低', status: 'info' },
    },
    rules: [{ required: true, message: '请选择优先级' }],
  },
  {
    dataIndex: 'assignee',
    title: '负责人',
    valueType: 'text',
  },
  {
    dataIndex: 'deadline',
    title: '截止日期',
    valueType: 'date',
  },
  {
    dataIndex: 'description',
    title: '描述',
    valueType: 'textarea',
    colSpan: 'full',
  },
]

async function handleSubmit(values: Record<string, unknown>) {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  ElMessage.success(`任务 "${values.taskName}" 创建成功`)
  return true
}
</script>

<template>
  <ModalForm title="新建任务" :fields="fields" :on-submit="handleSubmit" :columns="2">
    <template #trigger>
      <el-button type="primary">新建任务</el-button>
    </template>
  </ModalForm>
</template>
