<script setup lang="ts">
import { ProTable } from '@pro/table'
import type { ProColumnDef, RequestParams, RequestResult } from '@pro/utils'
import { ElButton, ElMessage, ElDropdown, ElDropdownMenu, ElDropdownItem } from 'element-plus'

interface ProjectRecord {
  id: number
  name: string
  owner: string
  status: string
  updatedAt: string
}

const TOTAL_PROJECTS = 25
const NETWORK_DELAY_MS = 500

const columns: ProColumnDef<ProjectRecord>[] = [
  { dataIndex: 'id', title: 'ID', width: 80, hideInSearch: true },
  { dataIndex: 'name', title: '项目名称', valueType: 'text' },
  { dataIndex: 'owner', title: '负责人', valueType: 'text', hideInSearch: true },
  {
    dataIndex: 'status',
    title: '状态',
    valueType: 'select',
    valueEnum: {
      active: { text: '进行中', status: 'success' },
      paused: { text: '已暂停', status: 'warning' },
      completed: { text: '已完成', status: 'info' },
    },
  },
  { dataIndex: 'updatedAt', title: '更新时间', valueType: 'dateTime', hideInSearch: true },
]

async function request(params: RequestParams): Promise<RequestResult<ProjectRecord>> {
  await new Promise((resolve) => setTimeout(resolve, NETWORK_DELAY_MS))
  const data: ProjectRecord[] = Array.from({ length: TOTAL_PROJECTS }, (_, i) => ({
    id: i + 1,
    name: `项目 ${String.fromCharCode(65 + (i % 26))}`,
    owner: ['Alice', 'Bob', 'Charlie'][i % 3],
    status: ['active', 'paused', 'completed'][i % 3],
    updatedAt: new Date(2026, 2, 30 - i).toISOString(),
  }))
  const start = (params.current - 1) * params.pageSize
  return { data: data.slice(start, start + params.pageSize), total: data.length, success: true }
}

function handleCreate() {
  ElMessage.info('打开创建对话框')
}

function handleExport() {
  ElMessage.info('导出数据')
}
</script>

<template>
  <ProTable
    :columns="columns"
    :request="request"
    header-title="项目管理"
    row-key="id"
    :search="true"
    :toolbar="{ settings: ['density', 'columnSetting', 'fullScreen'] }"
  >
    <template #toolbarActions>
      <ElButton type="primary" @click="handleCreate">新建项目</ElButton>
      <ElDropdown>
        <ElButton>更多操作</ElButton>
        <template #dropdown>
          <ElDropdownMenu>
            <ElDropdownItem @click="handleExport">导出数据</ElDropdownItem>
          </ElDropdownMenu>
        </template>
      </ElDropdown>
    </template>
  </ProTable>
</template>
