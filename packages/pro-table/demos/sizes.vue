<script setup lang="ts">
import { ProTable } from '@pro/table'
import type { ProColumnDef } from '@pro/utils'

interface MemberRecord {
  id: number
  name: string
  role: string
  email: string
  status: string
}

const columns: ProColumnDef<MemberRecord>[] = [
  { dataIndex: 'id', title: 'ID', width: 80 },
  { dataIndex: 'name', title: '姓名', valueType: 'text' },
  { dataIndex: 'role', title: '职位', valueType: 'text' },
  { dataIndex: 'email', title: '邮箱', valueType: 'text' },
  {
    dataIndex: 'status',
    title: '状态',
    valueType: 'select',
    valueEnum: {
      active: { text: '在职', status: 'success' },
      resigned: { text: '离职', status: 'danger' },
    },
  },
]

const data: MemberRecord[] = [
  { id: 1, name: '陈明远', role: '前端工程师', email: 'chen@example.com', status: 'active' },
  { id: 2, name: '林思雨', role: '产品经理', email: 'lin@example.com', status: 'active' },
  { id: 3, name: '王浩然', role: 'UI 设计师', email: 'wang@example.com', status: 'resigned' },
]
</script>

<template>
  <ProTable
    :columns="columns"
    :data="data"
    header-title="密度切换"
    row-key="id"
    :search="false"
    :pagination="false"
    :toolbar="{ density: true, columnSetting: false, fullscreen: false }"
  />
</template>
