<script setup lang="ts">
import { ProForm } from '@pro/form'
import { ElMessage } from 'element-plus'

const fields = [
  {
    dataIndex: 'name',
    title: '姓名',
    valueType: 'text' as const,
    searchConfig: {
      rules: [{ required: true, message: '请输入姓名' }],
    },
  },
  {
    dataIndex: 'email',
    title: '邮箱',
    valueType: 'text' as const,
    searchConfig: {
      rules: [
        { required: true, message: '请输入邮箱' },
        { type: 'email' as const, message: '请输入有效的邮箱地址' },
      ],
    },
  },
  {
    dataIndex: 'role',
    title: '角色',
    valueType: 'select' as const,
    valueEnum: {
      admin: { text: '管理员' },
      editor: { text: '编辑' },
      viewer: { text: '访客' },
    },
  },
  {
    dataIndex: 'birthday',
    title: '生日',
    valueType: 'date' as const,
  },
  {
    dataIndex: 'bio',
    title: '简介',
    valueType: 'textarea' as const,
  },
]

interface BasicFormValues {
  name: string
  email: string
  role: string
  birthday: string
  bio: string
}

async function handleSubmit(values: BasicFormValues) {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000))
  ElMessage.success(`提交成功: ${JSON.stringify(values)}`)
  return true
}
</script>

<template>
  <ProForm :fields="fields" :on-submit="handleSubmit" :initial-values="{ role: 'editor' }" />
</template>
