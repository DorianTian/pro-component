<script setup lang="ts">
import { ProForm } from '@pro/form'
import { ElMessage } from 'element-plus'
import type { ProFieldDef } from '@pro/utils'

const fields: ProFieldDef[] = [
  { dataIndex: 'text', title: 'text 文本', valueType: 'text', placeholder: '请输入文本' },
  { dataIndex: 'number', title: 'number 数字', valueType: 'number' },
  { dataIndex: 'textarea', title: 'textarea 多行文本', valueType: 'textarea' },
  {
    dataIndex: 'select',
    title: 'select 下拉选择',
    valueType: 'select',
    valueEnum: {
      option1: { text: '选项一' },
      option2: { text: '选项二' },
      option3: { text: '选项三' },
    },
  },
  {
    dataIndex: 'radio',
    title: 'radio 单选',
    valueType: 'radio',
    valueEnum: {
      a: { text: '方案 A' },
      b: { text: '方案 B' },
      c: { text: '方案 C' },
    },
  },
  {
    dataIndex: 'checkbox',
    title: 'checkbox 多选',
    valueType: 'checkbox',
    valueEnum: {
      vue: { text: 'Vue' },
      react: { text: 'React' },
      angular: { text: 'Angular' },
    },
  },
  { dataIndex: 'switch', title: 'switch 开关', valueType: 'switch' },
  { dataIndex: 'date', title: 'date 日期', valueType: 'date' },
  { dataIndex: 'dateTime', title: 'dateTime 日期时间', valueType: 'dateTime' },
  { dataIndex: 'rate', title: 'rate 评分', valueType: 'rate' },
  { dataIndex: 'slider', title: 'slider 滑块', valueType: 'slider' },
]

const initialValues = {
  text: 'Hello Pro',
  number: 42,
  textarea: '多行文本内容',
  select: 'option1',
  radio: 'a',
  checkbox: ['vue'],
  switch: true,
  date: '2026-04-01',
  dateTime: '2026-04-01T10:00:00',
  rate: 4,
  slider: 60,
}

async function handleSubmit(values: Record<string, unknown>) {
  await new Promise((resolve) => setTimeout(resolve, 500))
  ElMessage.success(`提交成功: ${JSON.stringify(values)}`)
  return true
}
</script>

<template>
  <ProForm
    :fields="fields"
    :initial-values="initialValues"
    :on-submit="handleSubmit"
    layout="vertical"
    :columns="2"
  />
</template>
