---
outline: deep
---

# ProTable 高级表格

Schema 驱动的数据表格，内置搜索表单、分页、列设置、工具栏。一份 `columns` 定义同时描述表格列、搜索控件和详情字段。

## 基础用法

使用静态 `data` 直接渲染表格。

<demo vue="../../packages/pro-table/demos/basic.vue" />

## 远程请求模式

通过 `request` 函数自动管理加载状态、分页和搜索参数。

<demo vue="../../packages/pro-table/demos/request.vue" />

## Composable 受控模式

使用 `useProTable` 获得完整状态控制，将 `proTableProps` 绑定到组件。

<demo vue="../../packages/pro-table/demos/composable.vue" />

## 搜索表单

根据 `columns` 中的 `valueType` 和 `searchConfig` 自动生成搜索表单，支持配置列宽、排序和折叠。

<demo vue="../../packages/pro-table/demos/search.vue" />

## ValueType 展示

展示所有内置 ValueType 的渲染效果。

<demo vue="../../packages/pro-table/demos/value-types.vue" />

## 工具栏

配置 `toolbar` 开启密度切换、列设置、全屏功能。通过 `#toolbarActions` 插槽添加自定义操作按钮。

<demo vue="../../packages/pro-table/demos/toolbar.vue" />

## Slots

| 插槽名           | 说明             | 作用域参数                     |
| ---------------- | ---------------- | ------------------------------ |
| `toolbarActions` | 工具栏右侧操作区 | —                              |
| `toolbarTitle`   | 自定义标题区域   | —                              |
| `headerCell`     | 自定义表头单元格 | `{ column, index }`            |
| `bodyCell`       | 自定义表体单元格 | `{ column, row, index, text }` |
| `expandedRow`    | 展开行内容       | `{ row, index }`               |
| `summary`        | 表格底部合计行   | `{ data }`                     |
| `empty`          | 空状态           | —                              |

## API

<ApiTable src="ProTable" />

### ProColumnDef

```typescript
interface ProColumnDef<T = Record<string, unknown>> {
  dataIndex: keyof T | string
  title: string
  key?: string
  valueType?: ValueType
  valueEnum?: Record<string, { text: string; status?: StatusType }>
  width?: number | string
  fixed?: 'left' | 'right'
  sortable?: boolean | 'custom'
  ellipsis?: boolean
  copyable?: boolean
  render?: (row: T, index: number) => VNode
  hideInSearch?: boolean
  hideInTable?: boolean
  hideInDescriptions?: boolean
  searchConfig?: {
    order?: number
    span?: number
    defaultValue?: unknown
    rules?: FormRule[]
    render?: () => VNode
  }
  descriptionsRender?: (value: unknown, row: T) => VNode
}
```

### RequestParams

```typescript
interface RequestParams {
  current: number
  pageSize: number
  [key: string]: unknown
}
```

### RequestResult

```typescript
interface RequestResult<T = Record<string, unknown>> {
  data: T[]
  total: number
  success: boolean
}
```
