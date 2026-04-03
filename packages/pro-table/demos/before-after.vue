<script setup lang="ts">
import { ref } from 'vue'
import { ProTable } from '@pro/table'
import type { ProColumnDef, RequestParams, RequestResult } from '@pro/utils'

interface LogRecord {
  id: number
  action: string
  operator: string
  timestamp: string
  level: string
}

const NETWORK_DELAY_MS = 600

const columns: ProColumnDef<LogRecord>[] = [
  { dataIndex: 'id', title: 'ID', width: 80, hideInSearch: true },
  { dataIndex: 'action', title: '操作', valueType: 'text' },
  { dataIndex: 'operator', title: '操作人', valueType: 'text', hideInSearch: true },
  { dataIndex: 'timestamp', title: '时间', valueType: 'dateTime', hideInSearch: true },
  {
    dataIndex: 'level',
    title: '级别',
    valueType: 'select',
    valueEnum: {
      info: { text: '信息', status: 'info' },
      warning: { text: '警告', status: 'warning' },
      error: { text: '错误', status: 'danger' },
    },
  },
]

const transformLog = ref<string[]>([])

/**
 * 模拟后端 API 返回非标准格式的数据。
 * 实际场景中可能返回 { code, msg, result: { list, pagination } } 等格式。
 */
async function request(params: RequestParams): Promise<RequestResult<LogRecord>> {
  await new Promise((resolve) => setTimeout(resolve, NETWORK_DELAY_MS))

  const operators = ['陈明远', '林思雨', '王浩然']
  const actions = ['登录系统', '修改配置', '导出报表', '删除记录', '审批通过']
  const TOTAL = 45
  const allData = Array.from({ length: TOTAL }, (_, i) => ({
    id: i + 1,
    action: actions[i % 5],
    operator: operators[i % 3],
    timestamp: new Date(2026, 2, 30, 8 + i).toISOString(),
    level: ['info', 'warning', 'error'][i % 3],
  }))

  let filtered = allData
  if (params.level) {
    filtered = filtered.filter((r) => r.level === params.level)
  }
  if (params.action) {
    filtered = filtered.filter((r) => r.action.includes(String(params.action)))
  }

  const start = (params.current - 1) * params.pageSize
  return {
    data: filtered.slice(start, start + params.pageSize),
    total: filtered.length,
    success: true,
  }
}

/**
 * beforeRequest：在请求发出前对参数做转换。
 * 例如给所有请求统一注入额外参数、修改字段名等。
 */
function handleBeforeRequest(params: RequestParams): RequestParams {
  const transformed = { ...params, _source: 'pro-table-demo' }
  transformLog.value = [
    ...transformLog.value.slice(-2),
    `[beforeRequest] 注入 _source 参数，当前页 ${params.current}`,
  ]
  return transformed
}

/**
 * afterResponse：在响应返回后对数据做转换。
 * 适用于后端返回格式不符合 RequestResult 的场景。
 */
function handleAfterResponse(raw: unknown): RequestResult {
  const result = raw as RequestResult<LogRecord>
  transformLog.value = [
    ...transformLog.value.slice(-2),
    `[afterResponse] 接收 ${result.data.length} 条数据，共 ${result.total} 条`,
  ]
  return result
}
</script>

<template>
  <div
    v-if="transformLog.length > 0"
    style="
      margin-bottom: 12px;
      padding: 8px 12px;
      background: #f5f7fa;
      border-radius: 4px;
      font-size: 12px;
      color: #666;
    "
  >
    <div v-for="(log, idx) in transformLog" :key="idx">{{ log }}</div>
  </div>
  <ProTable
    :columns="columns"
    :request="request"
    header-title="请求/响应转换钩子"
    row-key="id"
    :before-request="handleBeforeRequest"
    :after-response="handleAfterResponse"
  />
</template>
