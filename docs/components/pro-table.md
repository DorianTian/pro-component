---
outline: deep
---

# ProTable 高级表格

Schema 驱动的数据表格，内置搜索表单、分页、列设置、工具栏、行选择、可编辑行。一份 `columns` 定义同时描述表格列、搜索控件和详情字段。

## 基础用法

使用静态 `data` 直接渲染表格，无需 `request`。

<demo vue="../../packages/pro-table/demos/basic.vue" />

## 远程请求模式

通过 `request` 函数自动管理加载状态、分页和搜索参数。返回 `{ data, total, success }` 格式。

<demo vue="../../packages/pro-table/demos/request.vue" />

## Composable 受控模式

使用 `useProTable` composable 获得完整状态控制，通过 `proTableProps` 绑定到组件。适用于需要在组件外操作数据的场景。

<demo vue="../../packages/pro-table/demos/composable.vue" />

## 搜索表单

根据 `columns` 中的 `valueType` 和 `searchConfig` 自动生成搜索表单。支持配置列宽、排序、折叠和默认值。

<demo vue="../../packages/pro-table/demos/search.vue" />

## ValueType 展示

展示所有内置 ValueType 的渲染效果，包括 text、number、money、percent、date、dateTime、select、switch、progress、image、code。

<demo vue="../../packages/pro-table/demos/value-types.vue" />

## 工具栏与全屏

通过 `toolbar` 配置密度切换、列设置、全屏功能。使用 `#toolbarActions` 插槽或 `toolbarActions` prop 添加自定义操作按钮。

<demo vue="../../packages/pro-table/demos/toolbar.vue" />

## 行选择与批量操作

配置 `rowSelection` 启用行选择，支持 checkbox/radio 模式和跨页选择。结合 `useProTable` 的 `selectedRows` 实现批量操作。

<demo vue="../../packages/pro-table/demos/selection.vue" />

## 可编辑表格

配置 `editable` 启用行内编辑，每列根据 `valueType` 自动渲染对应的编辑控件。

<demo vue="../../packages/pro-table/demos/editable.vue" />

## 列排序

支持本地排序和远程排序。设置 `sortable: true` 启用本地排序，`sortable: 'custom'` 配合 `request` 实现服务端排序。

<demo vue="../../packages/pro-table/demos/sort.vue" />

## 固定列

通过 `fixed: 'left'` 或 `fixed: 'right'` 固定列，配合水平滚动查看更多列。

<demo vue="../../packages/pro-table/demos/fixed-columns.vue" />

## 嵌套数据路径

`dataIndex` 支持点号分隔的嵌套路径（如 `'user.name'`、`'product.category.label'`），自动从嵌套对象中取值。

<demo vue="../../packages/pro-table/demos/nested-data.vue" />

## 自定义列渲染

通过列定义的 `render` 函数自定义单元格渲染，支持返回 VNode 实现复杂展示效果。

<demo vue="../../packages/pro-table/demos/custom-render.vue" />

## 请求/响应转换钩子

`beforeRequest` 在请求发出前转换参数，`afterResponse` 在响应返回后转换数据格式，适配各种后端接口规范。

<demo vue="../../packages/pro-table/demos/before-after.vue" />

## 密度切换

通过工具栏的密度切换按钮调整表格行高和间距，提供紧凑、默认、宽松三种密度。

<demo vue="../../packages/pro-table/demos/sizes.vue" />

## 分页配置

支持自定义每页条数、页码选项、禁用分页等配置。

<demo vue="../../packages/pro-table/demos/pagination.vue" />

## 空数据状态

表格无数据时的空状态展示，通过 `tableProps` 透传 `emptyText` 自定义提示文案。

<demo vue="../../packages/pro-table/demos/empty-state.vue" />

## 可展开行

通过 `#action` 插槽配合 `el-table-column type="expand"` 实现行展开详情。

<demo vue="../../packages/pro-table/demos/expandable.vue" />

## 斑马纹与边框

通过 `tableProps` 透传 `stripe` 和 `border` 属性，启用斑马纹和边框样式。

<demo vue="../../packages/pro-table/demos/stripe.vue" />

## API

### ProTable Props

| 属性             | 说明                 | 类型                                                   | 默认值   |
| ---------------- | -------------------- | ------------------------------------------------------ | -------- |
| `columns`        | 列定义               | `ProColumnDef[]`                                       | — (必填) |
| `data`           | 静态数据源           | `T[]`                                                  | —        |
| `request`        | 远程数据请求函数     | `(params: RequestParams) => Promise<RequestResult<T>>` | —        |
| `loading`        | 外部控制加载状态     | `boolean`                                              | —        |
| `rowKey`         | 行唯一标识           | `string \| ((row: T) => string)`                       | `'id'`   |
| `search`         | 搜索表单配置         | `boolean \| SearchConfig`                              | `true`   |
| `initialValues`  | 搜索表单初始值       | `Record<string, unknown>`                              | `{}`     |
| `toolbar`        | 工具栏配置           | `ToolbarConfig`                                        | `{}`     |
| `headerTitle`    | 表格标题             | `string \| VNode`                                      | `''`     |
| `toolbarActions` | 工具栏操作按钮       | `VNode[]`                                              | `[]`     |
| `pagination`     | 分页配置，false 禁用 | `false \| PaginationConfig`                            | `{}`     |
| `rowSelection`   | 行选择配置           | `RowSelectionConfig`                                   | —        |
| `editable`       | 可编辑行配置         | `EditableConfig`                                       | —        |
| `tableProps`     | 透传 el-table 属性   | `Record<string, unknown>`                              | `{}`     |
| `beforeRequest`  | 请求前参数转换       | `(params) => RequestParams`                            | —        |
| `afterResponse`  | 响应后数据转换       | `(raw) => RequestResult`                               | —        |

### ProTable Events

| 事件               | 说明     | 参数                                   |
| ------------------ | -------- | -------------------------------------- |
| `selection-change` | 选择变更 | `(keys: string[], rows: unknown[])`    |
| `sort-change`      | 排序变更 | `(sortState: { prop, order } \| null)` |
| `page-change`      | 分页变更 | `(pagination: { current, pageSize })`  |
| `reload`           | 刷新触发 | —                                      |
| `reset`            | 重置触发 | —                                      |

### ProTable Slots

| 插槽名           | 说明                   |
| ---------------- | ---------------------- |
| `toolbarActions` | 工具栏右侧操作按钮区域 |
| `action`         | 表格操作列             |

### ProColumnDef

| 属性                 | 说明                                 | 类型                                                | 默认值   |
| -------------------- | ------------------------------------ | --------------------------------------------------- | -------- |
| `dataIndex`          | 字段名，支持嵌套路径如 `'user.name'` | `string`                                            | — (必填) |
| `title`              | 列标题                               | `string`                                            | — (必填) |
| `key`                | 唯一标识，默认使用 dataIndex         | `string`                                            | —        |
| `valueType`          | 值类型，决定渲染和搜索控件           | `ValueType`                                         | `'text'` |
| `valueEnum`          | 枚举值映射                           | `Record<string, { text, status? }>`                 | —        |
| `width`              | 列宽                                 | `number \| string`                                  | —        |
| `minWidth`           | 最小列宽                             | `number \| string`                                  | `120`    |
| `fixed`              | 固定列                               | `'left' \| 'right'`                                 | —        |
| `sortable`           | 可排序                               | `boolean \| 'custom'`                               | —        |
| `ellipsis`           | 超出省略                             | `boolean`                                           | `true`   |
| `copyable`           | 可复制                               | `boolean`                                           | —        |
| `render`             | 自定义渲染                           | `(row, index) => VNode`                             | —        |
| `hideInSearch`       | 搜索表单中隐藏                       | `boolean`                                           | `false`  |
| `hideInTable`        | 表格中隐藏                           | `boolean`                                           | `false`  |
| `hideInForm`         | 表单中隐藏                           | `boolean`                                           | `false`  |
| `hideInDescriptions` | 描述列表中隐藏                       | `boolean`                                           | `false`  |
| `searchConfig`       | 搜索配置                             | `{ order?, span?, defaultValue?, rules?, render? }` | —        |
| `descriptionsRender` | 描述列表自定义渲染                   | `(value, row) => VNode`                             | —        |

### SearchConfig

| 属性               | 说明         | 类型               | 默认值   |
| ------------------ | ------------ | ------------------ | -------- |
| `span`             | 搜索字段列宽 | `number`           | `6`      |
| `defaultCollapsed` | 默认折叠     | `boolean`          | `false`  |
| `labelWidth`       | 标签宽度     | `string \| number` | `'80px'` |

### ToolbarConfig

| 属性            | 说明         | 类型      | 默认值  |
| --------------- | ------------ | --------- | ------- |
| `density`       | 显示密度切换 | `boolean` | `true`  |
| `columnSetting` | 显示列设置   | `boolean` | `true`  |
| `fullscreen`    | 显示全屏按钮 | `boolean` | `false` |

### RowSelectionConfig

| 属性              | 说明             | 类型                          | 默认值  |
| ----------------- | ---------------- | ----------------------------- | ------- |
| `rowKey`          | 行标识属性或函数 | `string \| ((row) => string)` | —       |
| `crossPageSelect` | 跨页选择保持     | `boolean`                     | `false` |
| `onChange`        | 选择变更回调     | `(keys, rows) => void`        | —       |

### EditableConfig

| 属性           | 说明                     | 类型                                          | 默认值 |
| -------------- | ------------------------ | --------------------------------------------- | ------ |
| `editableKeys` | 受控的编辑行 key         | `string[]`                                    | —      |
| `onSave`       | 保存回调，返回 true 确认 | `(key, row, originalRow) => Promise<boolean>` | —      |
| `onCancel`     | 取消回调                 | `(key, row) => void`                          | —      |
| `onDelete`     | 删除回调，返回 true 确认 | `(key, row) => Promise<boolean>`              | —      |
| `onChange`     | editableKeys 变更回调    | `(keys) => void`                              | —      |

### ValueType

支持的值类型：`text` `number` `digit` `money` `percent` `date` `dateTime` `dateRange` `select` `radio` `checkbox` `switch` `textarea` `progress` `image` `code` `index` `indexBorder` `option` `rate` `slider` `cascader` `treeSelect`
