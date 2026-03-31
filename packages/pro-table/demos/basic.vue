<script setup lang="ts">
import { ProTable } from '@pro/table'
import type { ProColumnDef } from '@pro/utils'

interface UserRecord {
  id: number
  name: string
  age: number
  email: string
  status: string
}

const columns: ProColumnDef<UserRecord>[] = [
  { dataIndex: 'id', title: 'ID', width: 80 },
  { dataIndex: 'name', title: '姓名', valueType: 'text' },
  { dataIndex: 'age', title: '年龄', valueType: 'number', width: 100 },
  { dataIndex: 'email', title: '邮箱', valueType: 'text', ellipsis: true, copyable: true },
  {
    dataIndex: 'status',
    title: '状态',
    valueType: 'select',
    valueEnum: {
      active: { text: '启用', status: 'success' },
      disabled: { text: '禁用', status: 'danger' },
    },
  },
]

const data: UserRecord[] = [
  { id: 1, name: '张三', age: 28, email: 'zhangsan@example.com', status: 'active' },
  { id: 2, name: '李四', age: 32, email: 'lisi@example.com', status: 'active' },
  { id: 3, name: '王五', age: 24, email: 'wangwu@example.com', status: 'disabled' },
  { id: 4, name: '赵六', age: 36, email: 'zhaoliu@example.com', status: 'active' },
]
</script>

<template>
  <ProTable :columns="columns" :data="data" header-title="基础用法" row-key="id" :search="false" />
</template>
