<script setup lang="ts">
import { ref } from 'vue'
import { ProForm } from '@pro/form'
import { ElRadioGroup, ElRadioButton, ElMessage } from 'element-plus'

import type { ProFormItem } from '@pro/utils'

const columnCount = ref(3)

const fields: ProFormItem[] = [
  { dataIndex: 'firstName', title: '名', valueType: 'text' },
  { dataIndex: 'lastName', title: '姓', valueType: 'text' },
  { dataIndex: 'email', title: '邮箱', valueType: 'text' },
  { dataIndex: 'phone', title: '手机号', valueType: 'text' },
  {
    dataIndex: 'department',
    title: '部门',
    valueType: 'select',
    valueEnum: {
      engineering: { text: '工程部' },
      product: { text: '产品部' },
      design: { text: '设计部' },
      marketing: { text: '市场部' },
    },
  },
  { dataIndex: 'joinDate', title: '入职日期', valueType: 'date' },
  { dataIndex: 'address', title: '地址', valueType: 'text', colSpan: 2 },
  { dataIndex: 'bio', title: '简介', valueType: 'textarea', colSpan: 'full' },
]

async function handleSubmit(values: Record<string, unknown>) {
  await new Promise((resolve) => setTimeout(resolve, 500))
  ElMessage.success('提交成功')
  return true
}
</script>

<template>
  <div style="margin-bottom: 16px">
    <span style="margin-right: 12px">列数：</span>
    <ElRadioGroup v-model="columnCount" size="small">
      <ElRadioButton :value="1">1 列</ElRadioButton>
      <ElRadioButton :value="2">2 列</ElRadioButton>
      <ElRadioButton :value="3">3 列</ElRadioButton>
      <ElRadioButton :value="4">4 列</ElRadioButton>
    </ElRadioGroup>
  </div>

  <ProForm :fields="fields" :columns="columnCount" :on-submit="handleSubmit" />
</template>
