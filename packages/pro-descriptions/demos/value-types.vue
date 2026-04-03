<script setup lang="ts">
import { ProDescriptions } from '@pro/descriptions'
import type { ProColumnDef } from '@pro/utils'

const columns: ProColumnDef[] = [
  { dataIndex: 'text', title: 'text 文本', valueType: 'text' },
  { dataIndex: 'number', title: 'number 数字', valueType: 'number' },
  { dataIndex: 'money', title: 'money 金额', valueType: 'money' },
  { dataIndex: 'percent', title: 'percent 百分比', valueType: 'percent' },
  { dataIndex: 'date', title: 'date 日期', valueType: 'date' },
  { dataIndex: 'dateTime', title: 'dateTime 日期时间', valueType: 'dateTime' },
  {
    dataIndex: 'status',
    title: 'select 枚举',
    valueType: 'select',
    valueEnum: {
      active: { text: '运行中', status: 'success' },
      stopped: { text: '已停止', status: 'danger' },
      pending: { text: '待审核', status: 'warning' },
    },
  },
  { dataIndex: 'switch', title: 'switch 开关', valueType: 'switch' },
  { dataIndex: 'progress', title: 'progress 进度', valueType: 'progress' },
  { dataIndex: 'rate', title: 'rate 评分', valueType: 'rate' },
  { dataIndex: 'code', title: 'code 代码', valueType: 'code' },
]

const data = {
  text: 'Pro Components',
  number: 86400,
  money: 12999.5,
  percent: 85.6,
  date: '2026-04-01',
  dateTime: '2026-04-01T14:30:00',
  status: 'active',
  switch: true,
  progress: 78,
  rate: 4.5,
  code: 'import { ProDescriptions } from "@pro/descriptions"',
}
</script>

<template>
  <ProDescriptions title="ValueType 展示" :columns="columns" :data="data" :column="2" border />
</template>
