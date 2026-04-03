<script setup lang="ts">
import { ref } from 'vue'
import { ProForm } from '@pro/form'
import { ElMessage } from 'element-plus'
import type { ProFieldDef } from '@pro/utils'

const formRef = ref<InstanceType<typeof ProForm> | null>(null)

const fields: ProFieldDef[] = [
  {
    dataIndex: 'name',
    title: '项目名称',
    valueType: 'text',
    rules: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  },
  {
    dataIndex: 'type',
    title: '项目类型',
    valueType: 'select',
    valueEnum: {
      frontend: { text: '前端项目' },
      backend: { text: '后端项目' },
      fullstack: { text: '全栈项目' },
      data: { text: '数据项目' },
    },
  },
  {
    dataIndex: 'priority',
    title: '优先级',
    valueType: 'radio',
    valueEnum: {
      high: { text: '高' },
      medium: { text: '中' },
      low: { text: '低' },
    },
  },
  { dataIndex: 'startDate', title: '开始日期', valueType: 'date' },
  { dataIndex: 'description', title: '项目描述', valueType: 'textarea' },
]

const initialValues = {
  name: '数据平台 v3.0',
  type: 'fullstack',
  priority: 'high',
  startDate: '2026-04-01',
  description: '全新架构的数据中台，支持实时和离线数据处理。',
}

async function handleSubmit(values: Record<string, unknown>) {
  await new Promise((resolve) => setTimeout(resolve, 800))
  ElMessage.success(`保存成功: ${JSON.stringify(values)}`)
  return true
}
</script>

<template>
  <ProForm
    ref="formRef"
    :fields="fields"
    :initial-values="initialValues"
    :on-submit="handleSubmit"
  />
</template>
