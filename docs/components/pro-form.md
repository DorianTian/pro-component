---
outline: deep
---

# ProForm 高级表单

基于 ValueType 体系自动生成表单控件，支持水平/垂直/行内三种布局。提供 ModalForm、DrawerForm、StepsForm 等高阶变体。

## 基础用法

通过 `fields` 定义表单字段，`valueType` 自动决定控件类型。

<demo vue="../../packages/pro-form/demos/basic.vue" />

## 布局模式

支持 `horizontal`（水平）、`vertical`（垂直）、`inline`（行内）三种布局。

<demo vue="../../packages/pro-form/demos/layout.vue" />

## 弹窗表单 ModalForm

将表单包裹在 `el-dialog` 中，适合新建/编辑场景。

<demo vue="../../packages/pro-form/demos/modal-form.vue" />

## 分步表单 StepsForm

多步骤表单，每步独立验证，最后统一提交。

<demo vue="../../packages/pro-form/demos/steps-form.vue" />

## Slots

| 插槽名              | 说明                 | 作用域参数                   |
| ------------------- | -------------------- | ---------------------------- |
| `submitter`         | 自定义提交按钮区域   | `{ submit, reset, loading }` |
| `[field.dataIndex]` | 自定义单个字段的渲染 | `{ value, onChange, field }` |

## API

<ApiTable src="ProForm" />

### ProFormProps

```typescript
interface ProFormProps {
  layout?: 'horizontal' | 'vertical' | 'inline'
  fields: ProFieldDef[]
  initialValues?: Record<string, unknown>
  onSubmit?: (values: Record<string, unknown>) => Promise<boolean>
  formProps?: Partial<ElFormProps>
}
```

### ProFieldDef

`ProFieldDef` 复用 `ProColumnDef` 中与表单相关的字段，核心属性包括：

```typescript
interface ProFieldDef {
  dataIndex: string
  title: string
  valueType: ValueType
  valueEnum?: Record<string, { text: string; status?: StatusType }>
  searchConfig?: {
    order?: number
    span?: number
    defaultValue?: unknown
    rules?: FormRule[]
    render?: () => VNode
  }
}
```

### ModalForm Props

```typescript
interface ModalFormProps extends ProFormProps {
  visible: boolean
  title: string
  width?: string | number
  modalProps?: Partial<ElDialogProps>
}
```

### StepsForm Props

```typescript
interface StepsFormProps {
  steps: Array<{
    title: string
    fields: ProFieldDef[]
  }>
  onSubmit?: (values: Record<string, unknown>) => Promise<boolean>
}
```
