<script setup lang="ts">
import { ProForm } from '@pro/form'
import type { ProFieldDef } from '@pro/utils'

const fields: ProFieldDef[] = [
  { dataIndex: 'name', title: '姓名', valueType: 'text', readonly: true },
  { dataIndex: 'email', title: '邮箱', valueType: 'text', readonly: true },
  {
    dataIndex: 'department',
    title: '部门',
    valueType: 'select',
    valueEnum: {
      engineering: { text: '工程部' },
      product: { text: '产品部' },
      design: { text: '设计部' },
    },
    disabled: true,
  },
  { dataIndex: 'joinDate', title: '入职日期', valueType: 'date', disabled: true },
  { dataIndex: 'salary', title: '月薪', valueType: 'number', readonly: true },
  { dataIndex: 'bio', title: '简介', valueType: 'textarea', readonly: true },
]

const initialValues = {
  name: '陈明远',
  email: 'chen.my@example.com',
  department: 'engineering',
  joinDate: '2022-03-15',
  salary: 35000,
  bio: '资深前端工程师，专注于 Vue 生态和组件库开发，拥有 5 年大型项目经验。',
}
</script>

<template>
  <ProForm :fields="fields" :initial-values="initialValues" :show-actions="false" />
</template>
