# 迁移指南

## 从 Element Plus 原生迁移到 ProTable

### Before: 手动组装表格 + 搜索 + 分页

```vue
<script setup lang="ts">
import { ref, reactive } from 'vue'

const tableData = ref([])
const loading = ref(false)
const total = ref(0)
const pagination = reactive({ current: 1, pageSize: 20 })
const searchForm = reactive({ name: '', status: '' })

async function fetchData() {
  loading.value = true
  try {
    const res = await fetch(
      `/api/users?page=${pagination.current}&size=${pagination.pageSize}&name=${searchForm.name}&status=${searchForm.status}`,
    )
    const data = await res.json()
    tableData.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.current = 1
  fetchData()
}

function handleReset() {
  searchForm.name = ''
  searchForm.status = ''
  pagination.current = 1
  fetchData()
}

function handlePageChange(page: number) {
  pagination.current = page
  fetchData()
}

fetchData()
</script>

<template>
  <!-- 搜索表单 -->
  <el-form :model="searchForm" inline>
    <el-form-item label="姓名">
      <el-input v-model="searchForm.name" />
    </el-form-item>
    <el-form-item label="状态">
      <el-select v-model="searchForm.status">
        <el-option label="启用" value="active" />
        <el-option label="禁用" value="disabled" />
      </el-select>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="handleReset">重置</el-button>
    </el-form-item>
  </el-form>

  <!-- 表格 -->
  <el-table :data="tableData" v-loading="loading">
    <el-table-column prop="name" label="姓名" />
    <el-table-column prop="status" label="状态">
      <template #default="{ row }">
        <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
          {{ row.status === 'active' ? '启用' : '禁用' }}
        </el-tag>
      </template>
    </el-table-column>
  </el-table>

  <!-- 分页 -->
  <el-pagination
    :current-page="pagination.current"
    :page-size="pagination.pageSize"
    :total="total"
    @current-change="handlePageChange"
  />
</template>
```

### After: ProTable 一体化

```vue
<script setup lang="ts">
import type { ProColumnDef } from '@pro/utils'

const columns: ProColumnDef[] = [
  { dataIndex: 'name', title: '姓名', valueType: 'text' },
  {
    dataIndex: 'status',
    title: '状态',
    valueType: 'select',
    valueEnum: {
      active: { text: '启用', status: 'success' },
      disabled: { text: '禁用', status: 'danger' },
    },
  },
]

const request = async (params: {
  current: number
  pageSize: number
  name?: string
  status?: string
}) => {
  const query = new URLSearchParams({
    page: String(params.current),
    size: String(params.pageSize),
    ...(params.name && { name: params.name }),
    ...(params.status && { status: params.status }),
  })
  const res = await fetch(`/api/users?${query}`)
  const data = await res.json()
  return { data: data.list, total: data.total, success: true }
}
</script>

<template>
  <ProTable
    :columns="columns"
    :request="request"
    header-title="用户管理"
    row-key="id"
    :search="true"
  />
</template>
```

**减少了什么：**

- 无需手动管理 `loading`、`pagination`、`searchForm` 状态
- 搜索表单从 `columns` 定义自动生成
- 分页组件内置，页码变化自动重新请求
- `valueEnum` 同时控制表格 Tag 渲染和搜索下拉选项

## 迁移检查清单

- [ ] 替换 `<el-table>` + 手动分页/搜索为 `<ProTable :columns :request />`
- [ ] 将列定义从 `<el-table-column>` 模板迁移为 `ProColumnDef[]` 数组
- [ ] 用 `valueType` + `valueEnum` 替代手动的渲染模板
- [ ] 需要外部状态控制时，切换到 `useProTable` composable 模式
- [ ] 替换 `<el-form>` 手动表单为 `<ProForm :fields />` 或 ProTable 内置搜索
- [ ] 详情展示从 `<el-descriptions>` 迁移为 `<ProDescriptions :columns :data />`，复用表格的 columns 定义
