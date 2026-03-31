<script setup lang="ts">
import { ProDescriptions } from '@pro/descriptions'
import type { ProColumnDef } from '@pro/utils'

const columns: ProColumnDef[] = [
  { dataIndex: 'name', title: '项目名称', valueType: 'text' },
  { dataIndex: 'version', title: '版本', valueType: 'text' },
  { dataIndex: 'downloads', title: '下载量', valueType: 'number' },
  { dataIndex: 'updatedAt', title: '更新时间', valueType: 'dateTime' },
  {
    dataIndex: 'status',
    title: '状态',
    valueType: 'select',
    valueEnum: {
      stable: { text: '稳定', status: 'success' },
      beta: { text: '测试', status: 'warning' },
    },
  },
  { dataIndex: 'license', title: '许可证', valueType: 'text' },
]

const data = {
  name: '@pro/components',
  version: '1.0.0',
  downloads: 12345,
  updatedAt: '2026-03-30T14:30:00',
  status: 'stable',
  license: 'MIT',
}
</script>

<template>
  <ProDescriptions title="边框模式" :columns="columns" :data="data" border />
</template>
