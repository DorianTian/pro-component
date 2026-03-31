---
outline: deep
---

# useProForm

`useProForm` 是 ProForm 的核心 composable，管理表单状态、验证和提交逻辑。

## 基本用法

```typescript
import { useProForm } from '@pro/hooks'

const {
  proFormProps, // 绑定到 <ProForm /> 的 props
  formValues, // Ref<Record<string, unknown>> — 表单值
  loading, // Ref<boolean> — 提交中状态
  setFieldValue, // (field: string, value: unknown) => void
  setFieldsValue, // (values: Record<string, unknown>) => void
  getFieldValue, // (field: string) => unknown
  getFieldsValue, // () => Record<string, unknown>
  validateFields, // (fields?: string[]) => Promise<boolean>
  resetFields, // () => void — 重置为初始值
  submit, // () => Promise<boolean> — 触发验证 + 提交
  clearValidation, // (fields?: string[]) => void — 清除验证状态
} = useProForm({
  fields,
  initialValues: { role: 'editor' },
  onSubmit: async (values) => {
    await api.createUser(values)
    return true
  },
})
```

## Options

```typescript
interface UseProFormOptions {
  /** 表单字段定义 */
  fields: ProFieldDef[]

  /** 初始值 */
  initialValues?: Record<string, unknown>

  /** 提交回调，返回 true 表示成功 */
  onSubmit?: (values: Record<string, unknown>) => Promise<boolean>

  /** 表单布局 */
  layout?: 'horizontal' | 'vertical' | 'inline'
}
```

## 返回值

| 返回值            | 类型                                        | 说明                             |
| ----------------- | ------------------------------------------- | -------------------------------- |
| `proFormProps`    | `ComputedRef<ProFormProps>`                 | 绑定到 ProForm 组件的 props 对象 |
| `formValues`      | `Ref<Record<string, unknown>>`              | 当前表单值                       |
| `loading`         | `Ref<boolean>`                              | 提交中状态                       |
| `setFieldValue`   | `(field: string, value: unknown) => void`   | 设置单个字段值                   |
| `setFieldsValue`  | `(values: Record<string, unknown>) => void` | 批量设置字段值                   |
| `getFieldValue`   | `(field: string) => unknown`                | 获取单个字段值                   |
| `getFieldsValue`  | `() => Record<string, unknown>`             | 获取所有字段值                   |
| `validateFields`  | `(fields?: string[]) => Promise<boolean>`   | 验证指定字段（不传则全部验证）   |
| `resetFields`     | `() => void`                                | 重置为初始值                     |
| `submit`          | `() => Promise<boolean>`                    | 触发验证并调用 onSubmit          |
| `clearValidation` | `(fields?: string[]) => void`               | 清除验证错误提示                 |

## 与 ModalForm / DrawerForm 配合

高阶表单变体（ModalForm、DrawerForm）内部使用 `useProForm`。如果需要外部控制，同样可以使用 composable 模式：

```typescript
const { proFormProps, submit, resetFields } = useProForm({ fields, onSubmit })

// 外部按钮触发提交
async function handleOk() {
  const success = await submit()
  if (success) dialogVisible.value = false
}
```
