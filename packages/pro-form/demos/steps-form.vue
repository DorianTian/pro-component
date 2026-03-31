<script setup lang="ts">
import { StepsForm } from '@pro/form'
import { ElMessage } from 'element-plus'

const steps = [
  {
    title: '基本信息',
    fields: [
      {
        dataIndex: 'companyName',
        title: '公司名称',
        valueType: 'text' as const,
        searchConfig: { rules: [{ required: true, message: '请输入公司名称' }] },
      },
      {
        dataIndex: 'industry',
        title: '行业',
        valueType: 'select' as const,
        valueEnum: {
          tech: { text: '科技' },
          finance: { text: '金融' },
          healthcare: { text: '医疗' },
          education: { text: '教育' },
        },
      },
    ],
  },
  {
    title: '联系方式',
    fields: [
      {
        dataIndex: 'contactName',
        title: '联系人',
        valueType: 'text' as const,
        searchConfig: { rules: [{ required: true, message: '请输入联系人' }] },
      },
      {
        dataIndex: 'contactPhone',
        title: '电话',
        valueType: 'text' as const,
      },
      {
        dataIndex: 'contactEmail',
        title: '邮箱',
        valueType: 'text' as const,
        searchConfig: {
          rules: [{ type: 'email' as const, message: '请输入有效邮箱' }],
        },
      },
    ],
  },
  {
    title: '补充信息',
    fields: [
      {
        dataIndex: 'notes',
        title: '备注',
        valueType: 'textarea' as const,
      },
    ],
  },
]

interface StepsFormValues {
  companyName: string
  industry: string
  contactName: string
  contactPhone: string
  contactEmail: string
  notes: string
}

async function handleSubmit(values: StepsFormValues) {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  ElMessage.success(`注册完成: ${JSON.stringify(values)}`)
  return true
}
</script>

<template>
  <StepsForm :steps="steps" :on-submit="handleSubmit" />
</template>
