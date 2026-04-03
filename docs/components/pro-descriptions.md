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

## 不同尺寸

通过 `size` 属性切换大、中、小三种尺寸。

<demo vue="../../packages/pro-descriptions/demos/sizes.vue" />

## 列数控制

通过 `column` 属性控制一行显示的字段数量，适配不同宽度的容器。

<demo vue="../../packages/pro-descriptions/demos/column-count.vue" />

## ValueType 展示

展示所有常用 valueType 在描述列表中的渲染效果。

<demo vue="../../packages/pro-descriptions/demos/value-types.vue" />

## 隐藏敏感字段

通过 `hideInDescriptions` 控制字段可见性，隐藏敏感信息（如身份证、密码）。

<demo vue="../../packages/pro-descriptions/demos/hide-fields.vue" />

## 垂直布局

通过 `descriptionsProps` 透传 `direction: 'vertical'` 实现标签在上、内容在下的垂直布局。

<demo vue="../../packages/pro-descriptions/demos/vertical.vue" />

## 异步加载详情

模拟从接口异步加载详情数据，加载期间显示骨架屏。

<demo vue="../../packages/pro-descriptions/demos/request.vue" />

## 结合 ProForm 编辑

将 ProDescriptions 与 ProForm 结合，实现查看/编辑模式切换。

<demo vue="../../packages/pro-descriptions/demos/editable.vue" />

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
