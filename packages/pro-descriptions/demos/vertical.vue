<script setup lang="ts">
import { ProDescriptions } from '@pro/descriptions'
import type { ProColumnDef } from '@pro/utils'

const columns: ProColumnDef[] = [
  { dataIndex: 'name', title: '服务名称', valueType: 'text' },
  {
    dataIndex: 'status',
    title: '运行状态',
    valueType: 'select',
    valueEnum: {
      running: { text: '运行中', status: 'success' },
      stopped: { text: '已停止', status: 'danger' },
    },
  },
  { dataIndex: 'version', title: '版本', valueType: 'text' },
  { dataIndex: 'uptime', title: '运行时长', valueType: 'text' },
  { dataIndex: 'cpu', title: 'CPU 使用率', valueType: 'percent' },
  { dataIndex: 'memory', title: '内存使用', valueType: 'text' },
  { dataIndex: 'lastDeploy', title: '最近部署', valueType: 'dateTime' },
  { dataIndex: 'deployer', title: '部署人', valueType: 'text' },
]

const data = {
  name: 'pro-api-gateway',
  status: 'running',
  version: 'v2.4.1',
  uptime: '15 天 8 小时 32 分钟',
  cpu: 23.5,
  memory: '1.2 GB / 4 GB',
  lastDeploy: '2026-03-28T16:45:00',
  deployer: '陈明远',
}
</script>

<template>
  <ProDescriptions
    title="垂直布局"
    :columns="columns"
    :data="data"
    :column="4"
    :descriptions-props="{ direction: 'vertical' }"
    border
  />
</template>
