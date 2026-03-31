---
outline: deep
---

# useProTable

`useProTable` 是 ProTable 的核心 composable，管理表格的全部状态和逻辑。当需要从组件外部控制表格行为时（如外部按钮触发刷新、跨组件共享选中状态），使用 composable 模式。

## 基本用法

```typescript
import { useProTable } from '@pro/hooks'

const {
  proTableProps, // 绑定到 <ProTable /> 的 props
  dataSource, // Ref<T[]> — 当前页数据
  loading, // Ref<boolean> — 加载状态
  pagination, // Reactive — 分页状态
  formValues, // Ref<Record<string, unknown>> — 搜索表单值
  selectedRows, // Ref<T[]> — 选中行数据
  selectedRowKeys, // Ref<string[]> — 选中行 key
  clearSelection, // () => void — 清空选中
  sortState, // Ref<SortState | null> — 排序状态
  filterState, // Ref<Record<string, unknown>> — 筛选状态
  reload, // (resetPage?: boolean) => Promise<void> — 重新请求
  reset, // () => void — 重置所有状态
  setFormValues, // (values) => void — 设置搜索表单值
  setDataSource, // (data: T[]) => void — 直接设置数据
  insertRow, // (row: T, index?: number) => void — 插入行
  updateRow, // (key: string, row: Partial<T>) => void — 更新行
  deleteRow, // (key: string) => void — 删除行
} = useProTable({
  columns,
  request,
  rowKey: 'id',
  defaultPageSize: 20,
})
```

## 与组件绑定

将 `proTableProps` 展开绑定到 `<ProTable />`：

```vue
<template>
  <ProTable v-bind="proTableProps" header-title="表格标题" />
</template>
```

组件通过 provide/inject 检测外部 composable 实例是否存在。如果存在，使用外部实例；否则内部自动创建。

## Options

```typescript
interface UseProTableOptions<T = Record<string, unknown>> {
  /** 列定义 */
  columns: ProColumnDef<T>[]

  /** 数据请求函数 */
  request?: (params: RequestParams) => Promise<RequestResult<T>>

  /** 行唯一标识字段名 */
  rowKey?: string

  /** 默认分页大小 */
  defaultPageSize?: number

  /** 默认搜索表单值 */
  defaultFormValues?: Record<string, unknown>

  /** 请求前参数处理 */
  beforeRequest?: (params: RequestParams) => RequestParams

  /** 响应后数据处理 */
  afterResponse?: (raw: unknown) => RequestResult<T>

  /** 是否组件挂载时自动发起首次请求，默认 true */
  immediate?: boolean

  /** 防抖间隔（毫秒），默认 300 */
  debounceInterval?: number
}
```

## 返回值

| 返回值            | 类型                                     | 说明                                   |
| ----------------- | ---------------------------------------- | -------------------------------------- |
| `proTableProps`   | `ComputedRef<ProTableProps>`             | 绑定到 ProTable 组件的 props 对象      |
| `dataSource`      | `Ref<T[]>`                               | 当前页数据                             |
| `loading`         | `Ref<boolean>`                           | 加载状态                               |
| `pagination`      | `Reactive<PaginationState>`              | 分页状态（current、pageSize、total）   |
| `formValues`      | `Ref<Record<string, unknown>>`           | 搜索表单当前值                         |
| `selectedRows`    | `Ref<T[]>`                               | 当前选中的行数据                       |
| `selectedRowKeys` | `Ref<string[]>`                          | 当前选中行的 key 数组                  |
| `sortState`       | `Ref<SortState \| null>`                 | 当前排序状态                           |
| `filterState`     | `Ref<Record<string, unknown>>`           | 当前筛选状态                           |
| `clearSelection`  | `() => void`                             | 清空行选中                             |
| `reload`          | `(resetPage?: boolean) => Promise<void>` | 重新请求，resetPage=true 时回到第一页  |
| `reset`           | `() => void`                             | 重置所有状态（表单、分页、排序、筛选） |
| `setFormValues`   | `(values: Partial<FormValues>) => void`  | 设置搜索表单值并触发请求               |
| `setDataSource`   | `(data: T[]) => void`                    | 直接设置表格数据（受控模式）           |
| `insertRow`       | `(row: T, index?: number) => void`       | 在指定位置插入行                       |
| `updateRow`       | `(key: string, row: Partial<T>) => void` | 按 key 更新行数据                      |
| `deleteRow`       | `(key: string) => void`                  | 按 key 删除行                          |

## 内部 Composable 协作

`useProTable` 内部由多个细粒度 composable 组合而成：

```
useProTable
  ├── useRequest      — 管理请求生命周期（loading, debounce, cancel）
  ├── usePagination   — 管理分页状态和联动
  ├── useSelection    — 管理行选中状态和跨页保持
  ├── useSort         — 管理排序状态
  ├── useFilter       — 管理筛选状态
  └── useRowOps       — 管理行级 CRUD（insert, update, delete）
```

这些内部 composable 也从 `@pro/hooks` 导出，可以独立使用：

```typescript
import { useRequest, usePagination } from '@pro/hooks'
```
