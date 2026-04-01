<script setup lang="ts">
import { ProTable } from '@pro/table'
import type { ProColumnDef, RequestParams, RequestResult } from '@pro/utils'

interface ArticleRecord {
  id: number
  title: string
  author: string
  status: string
  createdAt: string
  views: number
}

const columns: ProColumnDef<ArticleRecord>[] = [
  { dataIndex: 'id', title: 'ID', width: 80 },
  { dataIndex: 'title', title: '标题', valueType: 'text', ellipsis: true },
  { dataIndex: 'author', title: '作者', valueType: 'text', hideInSearch: true },
  {
    dataIndex: 'status',
    title: '状态',
    valueType: 'select',
    valueEnum: {
      draft: { text: '草稿', status: 'default' },
      published: { text: '已发布', status: 'success' },
      archived: { text: '已归档', status: 'info' },
    },
  },
  { dataIndex: 'views', title: '浏览量', valueType: 'number', hideInSearch: true, sortable: true },
  { dataIndex: 'createdAt', title: '创建时间', valueType: 'dateTime', hideInSearch: true },
]

const TOTAL_RECORDS = 86
const NETWORK_DELAY_MS = 800

/**
 * Simulates a remote API request with pagination and filtering.
 */
async function request(params: RequestParams): Promise<RequestResult<ArticleRecord>> {
  await new Promise((resolve) => setTimeout(resolve, NETWORK_DELAY_MS))

  const allData: ArticleRecord[] = Array.from({ length: TOTAL_RECORDS }, (_, i) => ({
    id: i + 1,
    title: `文章标题 ${i + 1}`,
    author: ['陈明远', '林思雨', '王浩然'][i % 3],
    status: ['draft', 'published', 'archived'][i % 3],
    createdAt: new Date(2026, 0, 1 + i).toISOString(),
    views: Math.floor(Math.random() * 10000),
  }))

  // Apply filters
  let filtered = allData
  if (params.title) {
    filtered = filtered.filter((item) => item.title.includes(String(params.title)))
  }
  if (params.status) {
    filtered = filtered.filter((item) => item.status === params.status)
  }

  // Paginate
  const start = (params.current - 1) * params.pageSize
  const end = start + params.pageSize

  return {
    data: filtered.slice(start, end),
    total: filtered.length,
    success: true,
  }
}
</script>

<template>
  <ProTable
    :columns="columns"
    :request="request"
    header-title="远程请求模式"
    row-key="id"
    :search="true"
    :pagination="{ defaultPageSize: 10 }"
  />
</template>
