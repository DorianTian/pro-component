---
outline: deep
---

# ProDescriptions 定义列表

复用 ProTable 的 `columns` 定义渲染详情视图。一份 Schema 同时驱动表格和详情展示。

## 基础用法

传入 `columns` 和 `data` 渲染详情列表，`valueType` 控制值的格式化方式。

<demo vue="../../packages/pro-descriptions/demos/basic.vue" />

## 边框模式

设置 `border` 显示带边框的描述列表。

<demo vue="../../packages/pro-descriptions/demos/bordered.vue" />

## 加载状态

设置 `loading` 显示骨架屏加载效果。

<demo vue="../../packages/pro-descriptions/demos/loading.vue" />

## 自定义渲染

通过 `descriptionsRender` 自定义字段的渲染方式，支持进度条、链接等复杂展示。

<demo vue="../../packages/pro-descriptions/demos/custom-render.vue" />

## Columns 复用

同一份 `columns` 定义驱动 ProTable 和 ProDescriptions，点击表格行在抽屉中展示详情。

<demo vue="../../packages/pro-descriptions/demos/columns-reuse.vue" />

## API

### ProDescriptions Props

| 属性                | 说明                      | 类型                              | 默认值      |
| ------------------- | ------------------------- | --------------------------------- | ----------- |
| `columns`           | 列定义                    | `ProColumnDef[]`                  | — (必填)    |
| `data`              | 数据对象                  | `Record<string, unknown>`         | — (必填)    |
| `title`             | 标题                      | `string`                          | —           |
| `column`            | 一行展示几列              | `number`                          | `3`         |
| `border`            | 是否显示边框              | `boolean`                         | `false`     |
| `loading`           | 加载状态                  | `boolean`                         | `false`     |
| `size`              | 尺寸                      | `'large' \| 'default' \| 'small'` | `'default'` |
| `descriptionsProps` | 透传 el-descriptions 属性 | `Record<string, unknown>`         | —           |

### 字段可见性控制

通过 `ProColumnDef` 中的 `hideIn*` 字段控制各场景的可见性：

| 属性                 | 说明                           |
| -------------------- | ------------------------------ |
| `hideInTable`        | 在 ProTable 中隐藏             |
| `hideInSearch`       | 不生成搜索控件                 |
| `hideInForm`         | 在 ProForm / SchemaForm 中隐藏 |
| `hideInDescriptions` | 在 ProDescriptions 中隐藏      |
