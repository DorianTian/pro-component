<script setup lang="ts">
import { ref } from 'vue'
import { ProTable } from '@pro/table'
import { ElRadioGroup, ElRadioButton } from 'element-plus'
import type { ProColumnDef, RequestParams, RequestResult } from '@pro/utils'

interface TaskRecord {
  id: number
  title: string
  assignee: string
  status: string
  createdAt: string
}

type PaginationMode = 'default' | 'custom' | 'disabled'

const mode = ref<PaginationMode>('default')

const TOTAL_TASKS = 50
const NETWORK_DELAY_MS = 400

const columns: ProColumnDef<TaskRecord>[] = [
  { dataIndex: 'id', title: 'ID', width: 80, hideInSearch: true },
  { dataIndex: 'title', title: '任务名称', valueType: 'text' },
  { dataIndex: 'assignee', title: '负责人', valueType: 'text', hideInSearch: true },
  {
    dataIndex: 'status',
    title: '状态',
    valueType: 'select',
    valueEnum: {
      todo: { text: '待处理', status: 'default' },
      doing: { text: '进行中', status: 'warning' },
      done: { text: '已完成', status: 'success' },
    },
  },
  { dataIndex: 'createdAt', title: '创建时间', valueType: 'dateTime', hideInSearch: true },
]

async function request(params: RequestParams): Promise<RequestResult<TaskRecord>> {
  await new Promise((resolve) => setTimeout(resolve, NETWORK_DELAY_MS))

  const names = ['陈明远', '林思雨', '王浩然', '赵芷晴']
  const allData = Array.from({ length: TOTAL_TASKS }, (_, i) => ({
    id: i + 1,
    title: `任务 ${i + 1}：${['优化首页加载', '重构用户模块', '修复数据异常', '编写单元测试', '部署生产环境'][i % 5]}`,
    assignee: names[i % 4],
    status: ['todo', 'doing', 'done'][i % 3],
    createdAt: new Date(2026, 2, 1 + i).toISOString(),
  }))

  const start = (params.current - 1) * params.pageSize
  return {
    data: allData.slice(start, start + params.pageSize),
    total: allData.length,
    success: true,
  }
}

const CUSTOM_PAGE_SIZES = [5, 15, 30, 50]
const CUSTOM_DEFAULT_PAGE_SIZE = 5
</script>

<template>
  <div style="margin-bottom: 16px">
    <span style="margin-right: 12px">分页模式：</span>
    <ElRadioGroup v-model="mode">
      <ElRadioButton value="default">默认分页</ElRadioButton>
      <ElRadioButton value="custom">自定义分页</ElRadioButton>
      <ElRadioButton value="disabled">隐藏分页</ElRadioButton>
    </ElRadioGroup>
  </div>

  <ProTable
    v-if="mode === 'default'"
    :columns="columns"
    :request="request"
    header-title="默认分页"
    row-key="id"
    :search="false"
  />

  <ProTable
    v-else-if="mode === 'custom'"
    :columns="columns"
    :request="request"
    header-title="自定义分页"
    row-key="id"
    :search="false"
    :pagination="{ defaultPageSize: CUSTOM_DEFAULT_PAGE_SIZE, pageSizes: CUSTOM_PAGE_SIZES }"
  />

  <ProTable
    v-else
    :columns="columns"
    :request="request"
    header-title="隐藏分页"
    row-key="id"
    :search="false"
    :pagination="false"
  />
</template>
