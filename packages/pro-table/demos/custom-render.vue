<script setup lang="ts">
import { h } from 'vue'
import { ProTable } from '@pro/table'
import { ElTag, ElProgress, ElAvatar } from 'element-plus'
import type { ProColumnDef } from '@pro/utils'

interface ProjectRecord {
  id: number
  name: string
  leader: string
  avatar: string
  progress: number
  priority: string
  tags: string[]
}

const PROGRESS_COL_WIDTH = 200

const columns: ProColumnDef<ProjectRecord>[] = [
  { dataIndex: 'id', title: 'ID', width: 80 },
  {
    dataIndex: 'leader',
    title: '负责人',
    width: 160,
    render: (row) =>
      h('div', { style: 'display:flex;align-items:center;gap:8px' }, [
        h(ElAvatar, { size: 28, src: row.avatar }),
        h('span', row.leader),
      ]),
  },
  { dataIndex: 'name', title: '项目名称', valueType: 'text' },
  {
    dataIndex: 'progress',
    title: '进度',
    width: PROGRESS_COL_WIDTH,
    render: (row) =>
      h(ElProgress, {
        percentage: row.progress,
        strokeWidth: 10,
        status: row.progress >= 100 ? 'success' : undefined,
      }),
  },
  {
    dataIndex: 'priority',
    title: '优先级',
    width: 100,
    render: (row) => {
      const typeMap: Record<string, string> = { high: 'danger', medium: 'warning', low: 'info' }
      const labelMap: Record<string, string> = { high: '紧急', medium: '一般', low: '低' }
      return h(
        ElTag,
        { type: typeMap[row.priority] as 'danger', size: 'small' },
        () => labelMap[row.priority],
      )
    },
  },
  {
    dataIndex: 'tags',
    title: '标签',
    render: (row) =>
      h(
        'div',
        { style: 'display:flex;gap:4px;flex-wrap:wrap' },
        row.tags.map((tag) => h(ElTag, { size: 'small', effect: 'plain' }, () => tag)),
      ),
  },
]

const data: ProjectRecord[] = [
  {
    id: 1,
    name: '数据平台 v3.0',
    leader: '陈明远',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chen',
    progress: 85,
    priority: 'high',
    tags: ['前端', 'Vue3'],
  },
  {
    id: 2,
    name: '用户画像系统',
    leader: '林思雨',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lin',
    progress: 100,
    priority: 'medium',
    tags: ['大数据', 'Flink'],
  },
  {
    id: 3,
    name: '内部工具平台',
    leader: '王浩然',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wang',
    progress: 42,
    priority: 'low',
    tags: ['全栈', 'Node.js'],
  },
]
</script>

<template>
  <ProTable
    :columns="columns"
    :data="data"
    header-title="自定义列渲染"
    row-key="id"
    :search="false"
    :pagination="false"
  />
</template>
