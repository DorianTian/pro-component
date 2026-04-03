<script setup lang="ts">
import { ProDescriptions } from '@pro/descriptions'
import type { ProColumnDef } from '@pro/utils'

const columns: ProColumnDef[] = [
  { dataIndex: 'name', title: '姓名', valueType: 'text' },
  { dataIndex: 'idCard', title: '身份证号', valueType: 'text', hideInDescriptions: true },
  { dataIndex: 'phone', title: '手机号', valueType: 'text' },
  { dataIndex: 'password', title: '密码', valueType: 'text', hideInDescriptions: true },
  { dataIndex: 'email', title: '邮箱', valueType: 'text' },
  { dataIndex: 'department', title: '部门', valueType: 'text' },
  {
    dataIndex: 'status',
    title: '状态',
    valueType: 'select',
    valueEnum: {
      active: { text: '在职', status: 'success' },
      resigned: { text: '离职', status: 'danger' },
    },
  },
  { dataIndex: 'internalNote', title: '内部备注', valueType: 'text', hideInDescriptions: true },
]

const data = {
  name: '陈明远',
  idCard: '440300199X0101XXXX',
  phone: '138****8001',
  password: '******',
  email: 'chen.my@example.com',
  department: '工程部',
  status: 'active',
  internalNote: '绩效 A+，重点培养对象',
}
</script>

<template>
  <ProDescriptions title="隐藏敏感字段" :columns="columns" :data="data" border />
</template>
