<script setup lang="ts">
import { ProTable } from '@pro/table'
import type { ProColumnDef } from '@pro/utils'

interface RecordItem {
  id: number
  name: string
  status: string
}

const columns: ProColumnDef<RecordItem>[] = [
  { dataIndex: 'id', title: 'ID', width: 80 },
  { dataIndex: 'name', title: '名称', valueType: 'text' },
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

const emptyData: RecordItem[] = []
</script>

<template>
  <ProTable
    :columns="columns"
    :data="emptyData"
    header-title="空数据状态"
    row-key="id"
    :search="false"
    :pagination="false"
    :table-props="{ emptyText: '暂无数据，请添加记录或调整筛选条件' }"
  />
</template>
