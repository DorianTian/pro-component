<script setup lang="ts">
import { ProDescriptions } from '@pro/descriptions'
import type { ProColumnDef } from '@pro/utils'

const columns: ProColumnDef[] = [
  { dataIndex: 'name', title: '姓名', valueType: 'text' },
  { dataIndex: 'age', title: '年龄', valueType: 'number' },
  { dataIndex: 'email', title: '邮箱', valueType: 'text', copyable: true },
  {
    dataIndex: 'status',
    title: '状态',
    valueType: 'select',
    valueEnum: {
      active: { text: '在职', status: 'success' },
      resigned: { text: '离职', status: 'danger' },
    },
  },
  { dataIndex: 'salary', title: '薪资', valueType: 'money' },
  { dataIndex: 'joinDate', title: '入职日期', valueType: 'date' },
  { dataIndex: 'bio', title: '简介', valueType: 'textarea' },
]

const data = {
  name: '陈明远',
  age: 28,
  email: 'chen.my@example.com',
  status: 'active',
  salary: 25000,
  joinDate: '2023-06-15',
  bio: '资深前端工程师，专注于 Vue 生态和组件库开发。',
}
</script>

<template>
  <ProDescriptions title="员工详情" :columns="columns" :data="data" />
</template>
