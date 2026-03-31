<script setup lang="ts">
import { ref } from 'vue'
import { ProTable } from '@pro/table'
import { ProDescriptions } from '@pro/descriptions'
import type { ProColumnDef } from '@pro/utils'
import { ElDrawer } from 'element-plus'

interface UserRecord {
  id: number
  name: string
  role: string
  department: string
  status: string
  joinDate: string
}

/**
 * Same columns definition drives both the table and the descriptions panel.
 * Fields hidden in each view are controlled via hideInTable / hideInDescriptions.
 */
const columns: ProColumnDef<UserRecord>[] = [
  { dataIndex: 'id', title: 'ID', width: 80, hideInSearch: true, hideInDescriptions: true },
  { dataIndex: 'name', title: '姓名', valueType: 'text' },
  { dataIndex: 'role', title: '职位', valueType: 'text', hideInSearch: true },
  {
    dataIndex: 'department',
    title: '部门',
    valueType: 'select',
    valueEnum: {
      engineering: { text: '工程部' },
      product: { text: '产品部' },
      design: { text: '设计部' },
    },
  },
  {
    dataIndex: 'status',
    title: '状态',
    valueType: 'select',
    valueEnum: {
      active: { text: '在职', status: 'success' },
      resigned: { text: '离职', status: 'danger' },
    },
  },
  { dataIndex: 'joinDate', title: '入职日期', valueType: 'date', hideInSearch: true },
]

const isDrawerVisible = ref(false)
const selectedUser = ref<UserRecord | null>(null)

const tableData: UserRecord[] = [
  {
    id: 1,
    name: '张三',
    role: '前端工程师',
    department: 'engineering',
    status: 'active',
    joinDate: '2023-06-15',
  },
  {
    id: 2,
    name: '李四',
    role: '产品经理',
    department: 'product',
    status: 'active',
    joinDate: '2022-03-01',
  },
  {
    id: 3,
    name: '王五',
    role: 'UI 设计师',
    department: 'design',
    status: 'resigned',
    joinDate: '2021-09-20',
  },
]

function handleRowClick(row: UserRecord) {
  selectedUser.value = row
  isDrawerVisible.value = true
}
</script>

<template>
  <ProTable
    :columns="columns"
    :data="tableData"
    header-title="Columns 复用示例"
    row-key="id"
    :search="false"
    :table-props="{ highlightCurrentRow: true }"
    @row-click="handleRowClick"
  />

  <ElDrawer v-model="isDrawerVisible" title="用户详情" size="40%">
    <ProDescriptions v-if="selectedUser" :columns="columns" :data="selectedUser" />
  </ElDrawer>
</template>
