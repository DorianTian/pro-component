<script setup lang="ts">
import { DrawerForm } from '@pro/form'
import { ElMessage } from 'element-plus'

import type { ProFormItem } from '@pro/utils'

const fields: ProFormItem[] = [
  {
    dataIndex: 'name',
    title: '配置名称',
    valueType: 'text',
    rules: [{ required: true, message: '请输入名称' }],
  },
  {
    dataIndex: 'type',
    title: '类型',
    valueType: 'select',
    valueEnum: {
      api: { text: 'API' },
      webhook: { text: 'Webhook' },
      cron: { text: '定时任务' },
    },
    rules: [{ required: true, message: '请选择类型' }],
  },
  {
    dataIndex: 'endpoint',
    title: '端点地址',
    valueType: 'text',
    placeholder: 'https://api.example.com/webhook',
  },
  {
    dataIndex: 'enabled',
    title: '启用',
    valueType: 'switch',
    defaultValue: true,
  },
  {
    dataIndex: 'description',
    title: '描述',
    valueType: 'textarea',
  },
]

async function handleSubmit(values: Record<string, unknown>) {
  await new Promise((r) => setTimeout(r, 800))
  ElMessage.success(`配置 "${values.name}" 创建成功`)
  return true
}
</script>

<template>
  <DrawerForm title="新建配置" :fields="fields" :on-submit="handleSubmit">
    <template #trigger>
      <el-button type="primary">新建配置</el-button>
    </template>
  </DrawerForm>
</template>
