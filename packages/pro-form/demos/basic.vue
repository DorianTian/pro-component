<script setup lang="ts">
import { ProForm } from '@pro/form'
import { ElMessage } from 'element-plus'

import type { ProFormItem } from '@pro/utils'

const fields: ProFormItem[] = [
  {
    dataIndex: 'name',
    title: '姓名',
    valueType: 'text',
    rules: [{ required: true, message: '请输入姓名' }],
  },
  {
    dataIndex: 'email',
    title: '邮箱',
    valueType: 'text',
    rules: [
      { required: true, message: '请输入邮箱' },
      { type: 'email', message: '请输入有效的邮箱地址' },
    ],
  },
  {
    dataIndex: 'role',
    title: '角色',
    valueType: 'select',
    valueEnum: {
      admin: { text: '管理员' },
      editor: { text: '编辑' },
      viewer: { text: '访客' },
    },
  },
  {
    dataIndex: 'birthday',
    title: '生日',
    valueType: 'date',
  },
  {
    dataIndex: 'bio',
    title: '简介',
    valueType: 'textarea',
    colSpan: 'full',
  },
]

async function handleSubmit(values: Record<string, unknown>) {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  ElMessage.success('提交成功')
  return true
}
</script>

<template>
  <ProForm
    :fields="fields"
    :columns="2"
    :on-submit="handleSubmit"
    :initial-values="{ role: 'editor' }"
  />
</template>
