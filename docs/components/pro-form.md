---
outline: deep
---

# ProForm 高级表单

基于 ValueType 体系自动生成表单控件，支持水平/垂直/行内三种布局。提供 ModalForm、DrawerForm、StepsForm、LightFilter、SchemaForm 等变体，以及 ProFormDependency 字段联动和 ProFormList 动态数组字段。

## 基础用法

通过 `fields` 定义表单字段，`valueType` 自动决定控件类型。

<demo vue="../../packages/pro-form/demos/basic.vue" />

## 布局模式

支持 `horizontal`（水平）、`vertical`（垂直）、`inline`（行内）三种布局。

<demo vue="../../packages/pro-form/demos/layout.vue" />

## 弹窗表单 ModalForm

将表单包裹在 `el-dialog` 中，适合新建/编辑场景。提交成功后自动关闭。

<demo vue="../../packages/pro-form/demos/modal-form.vue" />

## 抽屉表单 DrawerForm

将表单包裹在 `el-drawer` 中，适合侧边编辑场景。

<demo vue="../../packages/pro-form/demos/drawer-form.vue" />

## 分步表单 StepsForm

多步骤表单，每步独立验证，最后统一提交。

<demo vue="../../packages/pro-form/demos/steps-form.vue" />

## 轻量筛选 LightFilter

紧凑的行内筛选器，活跃条件显示为可关闭的标签，点击字段名展开编辑。

<demo vue="../../packages/pro-form/demos/light-filter.vue" />

## SchemaForm

使用 ProTable 的 `columns` 定义直接渲染表单，实现 Table/Form/Descriptions 共用一套 Schema。

<demo vue="../../packages/pro-form/demos/schema-form.vue" />

## ProFormList 动态数组

管理数组类型的表单字段，支持新增、删除、复制操作。

<demo vue="../../packages/pro-form/demos/form-list.vue" />

## ProFormDependency 字段联动

根据其他字段的值动态渲染内容，实现字段间的联动逻辑。

<demo vue="../../packages/pro-form/demos/dependency.vue" />

## 表单验证

支持必填、正则、类型、自定义校验函数等多种验证规则，通过 `rules` 字段配置。

<demo vue="../../packages/pro-form/demos/validation.vue" />

## 只读表单

设置字段的 `readonly` 或 `disabled` 属性实现只读展示模式，适合详情页场景。

<demo vue="../../packages/pro-form/demos/readonly.vue" />

## 多列网格布局

通过 `columns` 属性控制一行显示几列，结合 `span` 实现灵活的栅格布局。

<demo vue="../../packages/pro-form/demos/grid.vue" />

## 自定义字段渲染

通过 `renderFormItem` 自定义字段控件，支持颜色选择器、滑块等非标准控件。

<demo vue="../../packages/pro-form/demos/custom-field.vue" />

## 初始值与重置

通过 `initialValues` 设置表单初始值，点击重置按钮恢复到初始状态。

<demo vue="../../packages/pro-form/demos/initial-values.vue" />

## ValueType 展示

展示所有常用 valueType 在表单中的渲染效果。

<demo vue="../../packages/pro-form/demos/value-types.vue" />

## 异步提交

提交时自动管理 loading 状态，防止重复提交，支持 `onError` 错误处理回调。

<demo vue="../../packages/pro-form/demos/async-submit.vue" />

## 条件字段联动

结合 ProFormDependency 根据字段值动态显示提示信息或额外表单内容。

<demo vue="../../packages/pro-form/demos/conditional-fields.vue" />

## API

### ProForm Props

| 属性            | 说明                         | 类型                                     | 默认值         |
| --------------- | ---------------------------- | ---------------------------------------- | -------------- |
| `fields`        | 字段定义                     | `ProFieldDef[]`                          | — (必填)       |
| `initialValues` | 初始值                       | `Record<string, unknown>`                | `{}`           |
| `onSubmit`      | 提交回调，返回 true 表示成功 | `(values) => Promise<boolean>`           | —              |
| `layout`        | 布局模式                     | `'horizontal' \| 'vertical' \| 'inline'` | `'horizontal'` |
| `labelWidth`    | 标签宽度                     | `string \| number`                       | —              |
| `columns`       | 一行显示几列                 | `number`                                 | `1`            |
| `formProps`     | 透传 el-form 属性            | `Record<string, unknown>`                | —              |

### ModalForm Props

| 属性                        | 说明                | 类型                           | 默认值 |
| --------------------------- | ------------------- | ------------------------------ | ------ |
| `visible / v-model:visible` | 弹窗可见性          | `boolean`                      | —      |
| `title`                     | 弹窗标题            | `string`                       | —      |
| `width`                     | 弹窗宽度            | `string \| number`             | —      |
| `fields`                    | 字段定义            | `ProFieldDef[]`                | —      |
| `onSubmit`                  | 提交回调            | `(values) => Promise<boolean>` | —      |
| `dialogProps`               | 透传 el-dialog 属性 | `Record<string, unknown>`      | —      |

### DrawerForm Props

| 属性                        | 说明                | 类型                           | 默认值  |
| --------------------------- | ------------------- | ------------------------------ | ------- |
| `visible / v-model:visible` | 抽屉可见性          | `boolean`                      | —       |
| `title`                     | 抽屉标题            | `string`                       | —       |
| `width`                     | 抽屉宽度            | `string \| number`             | `'30%'` |
| `fields`                    | 字段定义            | `ProFieldDef[]`                | —       |
| `onSubmit`                  | 提交回调            | `(values) => Promise<boolean>` | —       |
| `drawerProps`               | 透传 el-drawer 属性 | `Record<string, unknown>`      | —       |

### StepsForm Props

| 属性       | 说明             | 类型                           | 默认值   |
| ---------- | ---------------- | ------------------------------ | -------- |
| `steps`    | 步骤定义         | `StepFormDef[]`                | — (必填) |
| `onSubmit` | 最后一步提交回调 | `(values) => Promise<boolean>` | —        |

### LightFilter Props

| 属性            | 说明         | 类型                      | 默认值   |
| --------------- | ------------ | ------------------------- | -------- |
| `fields`        | 筛选字段定义 | `ProFieldDef[]`           | — (必填) |
| `initialValues` | 初始值       | `Record<string, unknown>` | —        |

### LightFilter Events

| 事件     | 说明         | 参数                                |
| -------- | ------------ | ----------------------------------- |
| `change` | 筛选条件变更 | `(values: Record<string, unknown>)` |
| `reset`  | 重置         | —                                   |

### SchemaForm Props

| 属性            | 说明                       | 类型                           | 默认值       |
| --------------- | -------------------------- | ------------------------------ | ------------ |
| `columns`       | 使用 ProColumnDef 定义表单 | `ProColumnDef[]`               | — (必填)     |
| `initialValues` | 初始值                     | `Record<string, unknown>`      | —            |
| `onSubmit`      | 提交回调                   | `(values) => Promise<boolean>` | —            |
| `layout`        | 布局模式                   | `FormLayout`                   | `'vertical'` |
| `gridColumns`   | 网格列数                   | `number`                       | `1`          |

### ProFormList Props

| 属性       | 说明                   | 类型            | 默认值     |
| ---------- | ---------------------- | --------------- | ---------- |
| `name`     | 数组字段在表单中的 key | `string`        | — (必填)   |
| `fields`   | 每行的字段定义         | `ProFieldDef[]` | — (必填)   |
| `max`      | 最大行数               | `number`        | `Infinity` |
| `min`      | 最小行数               | `number`        | `0`        |
| `copyable` | 显示复制按钮           | `boolean`       | `false`    |

### ProFormDependency Props

| 属性   | 说明             | 类型       | 默认值   |
| ------ | ---------------- | ---------- | -------- |
| `name` | 依赖的字段名数组 | `string[]` | — (必填) |

### ProFormDependency Scoped Slot

| 属性         | 说明             | 类型                      |
| ------------ | ---------------- | ------------------------- |
| `values`     | 依赖字段的当前值 | `Record<string, unknown>` |
| `formValues` | 完整的表单值     | `Record<string, unknown>` |

### ProFieldDef

| 属性         | 说明     | 类型                                | 默认值   |
| ------------ | -------- | ----------------------------------- | -------- |
| `dataIndex`  | 字段名   | `string`                            | — (必填) |
| `title`      | 标签文本 | `string`                            | — (必填) |
| `valueType`  | 值类型   | `ValueType`                         | `'text'` |
| `valueEnum`  | 枚举值   | `Record<string, { text, status? }>` | —        |
| `hideInForm` | 隐藏字段 | `boolean`                           | `false`  |
| `rules`      | 校验规则 | `FormRule[]`                        | —        |
| `tooltip`    | 字段提示 | `string`                            | —        |
| `span`       | 占用列数 | `number`                            | —        |
