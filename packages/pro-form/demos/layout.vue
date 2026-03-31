<script setup lang="ts">
import { ref } from 'vue'
import { ProForm } from '@pro/form'
import { ElRadioGroup, ElRadioButton } from 'element-plus'

type LayoutType = 'horizontal' | 'vertical' | 'inline'
const layout = ref<LayoutType>('horizontal')

const fields = [
  { dataIndex: 'firstName', title: '名', valueType: 'text' as const },
  { dataIndex: 'lastName', title: '姓', valueType: 'text' as const },
  { dataIndex: 'phone', title: '手机号', valueType: 'text' as const },
  {
    dataIndex: 'gender',
    title: '性别',
    valueType: 'radio' as const,
    valueEnum: {
      male: { text: '男' },
      female: { text: '女' },
    },
  },
]

interface LayoutFormValues {
  firstName: string
  lastName: string
  phone: string
  gender: string
}

async function handleSubmit(_values: LayoutFormValues) {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return true
}
</script>

<template>
  <div style="margin-bottom: 24px">
    <span style="margin-right: 12px">布局模式：</span>
    <ElRadioGroup v-model="layout">
      <ElRadioButton value="horizontal">水平</ElRadioButton>
      <ElRadioButton value="vertical">垂直</ElRadioButton>
      <ElRadioButton value="inline">行内</ElRadioButton>
    </ElRadioGroup>
  </div>

  <ProForm :layout="layout" :fields="fields" :on-submit="handleSubmit" />
</template>
