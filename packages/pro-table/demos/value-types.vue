<script setup lang="ts">
import { ProTable } from '@pro/table'
import type { ProColumnDef } from '@pro/utils'

interface ValueTypeRecord {
  id: number
  text: string
  number: number
  money: number
  percent: number
  date: string
  dateTime: string
  status: string
  switch: boolean
  progress: number
  image: string
  code: string
}

const PROGRESS_COL_WIDTH = 200
const IMAGE_COL_WIDTH = 100

const columns: ProColumnDef<ValueTypeRecord>[] = [
  { dataIndex: 'text', title: 'text', valueType: 'text' },
  { dataIndex: 'number', title: 'number', valueType: 'number' },
  { dataIndex: 'money', title: 'money', valueType: 'money' },
  { dataIndex: 'percent', title: 'percent', valueType: 'percent' },
  { dataIndex: 'date', title: 'date', valueType: 'date' },
  { dataIndex: 'dateTime', title: 'dateTime', valueType: 'dateTime' },
  {
    dataIndex: 'status',
    title: 'select',
    valueType: 'select',
    valueEnum: {
      open: { text: 'Open', status: 'success' },
      closed: { text: 'Closed', status: 'danger' },
      processing: { text: 'Processing', status: 'warning' },
    },
  },
  { dataIndex: 'switch', title: 'switch', valueType: 'switch' },
  { dataIndex: 'progress', title: 'progress', valueType: 'progress', width: PROGRESS_COL_WIDTH },
  { dataIndex: 'image', title: 'image', valueType: 'image', width: IMAGE_COL_WIDTH },
  { dataIndex: 'code', title: 'code', valueType: 'code' },
]

const data: ValueTypeRecord[] = [
  {
    id: 1,
    text: 'Hello World',
    number: 12345,
    money: 9999.99,
    percent: 0.856,
    date: '2026-03-30',
    dateTime: '2026-03-30T14:30:00',
    status: 'open',
    switch: true,
    progress: 75,
    image: 'https://via.placeholder.com/80x80',
    code: 'const x = 1',
  },
  {
    id: 2,
    text: 'Pro Components',
    number: 67890,
    money: 1234.56,
    percent: 0.423,
    date: '2026-01-15',
    dateTime: '2026-01-15T09:00:00',
    status: 'closed',
    switch: false,
    progress: 100,
    image: 'https://via.placeholder.com/80x80',
    code: 'return true',
  },
  {
    id: 3,
    text: 'ValueType Demo',
    number: 42,
    money: 0.01,
    percent: 1.0,
    date: '2026-06-01',
    dateTime: '2026-06-01T18:45:00',
    status: 'processing',
    switch: true,
    progress: 30,
    image: 'https://via.placeholder.com/80x80',
    code: 'npm run dev',
  },
]
</script>

<template>
  <ProTable
    :columns="columns"
    :data="data"
    header-title="ValueType 展示"
    row-key="id"
    :search="false"
    :pagination="false"
  />
</template>
