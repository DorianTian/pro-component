<script setup lang="ts">
import { ProTable } from '@pro/table'
import type { ProColumnDef } from '@pro/utils'

interface StudentRecord {
  id: number
  name: string
  grade: string
  score: number
  rank: number
  status: string
}

const columns: ProColumnDef<StudentRecord>[] = [
  { dataIndex: 'id', title: '学号', width: 80 },
  { dataIndex: 'name', title: '姓名', valueType: 'text' },
  { dataIndex: 'grade', title: '班级', valueType: 'text' },
  { dataIndex: 'score', title: '成绩', valueType: 'number' },
  { dataIndex: 'rank', title: '排名', valueType: 'number', width: 80 },
  {
    dataIndex: 'status',
    title: '等级',
    valueType: 'select',
    valueEnum: {
      excellent: { text: '优秀', status: 'success' },
      good: { text: '良好', status: 'info' },
      pass: { text: '及格', status: 'warning' },
      fail: { text: '不及格', status: 'danger' },
    },
  },
]

const data: StudentRecord[] = [
  { id: 1, name: '陈明远', grade: '三年一班', score: 96, rank: 1, status: 'excellent' },
  { id: 2, name: '林思雨', grade: '三年一班', score: 92, rank: 2, status: 'excellent' },
  { id: 3, name: '王浩然', grade: '三年二班', score: 85, rank: 5, status: 'good' },
  { id: 4, name: '赵芷晴', grade: '三年二班', score: 78, rank: 8, status: 'good' },
  { id: 5, name: '周启航', grade: '三年一班', score: 65, rank: 15, status: 'pass' },
  { id: 6, name: '刘雨桐', grade: '三年二班', score: 55, rank: 22, status: 'fail' },
]
</script>

<template>
  <ProTable
    :columns="columns"
    :data="data"
    header-title="斑马纹与边框"
    row-key="id"
    :search="false"
    :pagination="false"
    :table-props="{ stripe: true, border: true }"
  />
</template>
