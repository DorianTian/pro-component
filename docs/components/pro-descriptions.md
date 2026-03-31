---
outline: deep
---

# ProDescriptions 定义列表

复用 ProTable 的 `columns` 定义渲染详情视图。一份 Schema 同时驱动表格列展示和详情页展示。

## 基础用法

传入 `columns` 和 `data` 渲染详情列表，`valueType` 控制值的格式化方式。

<demo vue="../../packages/pro-descriptions/demos/basic.vue" />

## Columns 复用

同一份 `columns` 定义同时驱动 ProTable 和 ProDescriptions，点击表格行在抽屉中展示详情。

<demo vue="../../packages/pro-descriptions/demos/columns-reuse.vue" />

## Slots

| 插槽名               | 说明                 | 作用域参数                |
| -------------------- | -------------------- | ------------------------- |
| `title`              | 自定义标题           | —                         |
| `extra`              | 右上角操作区         | —                         |
| `[column.dataIndex]` | 自定义单个字段的渲染 | `{ value, data, column }` |

## API

<ApiTable src="ProDescriptions" />

### ProDescriptionsProps

```typescript
interface ProDescriptionsProps<T = Record<string, unknown>> {
  title?: string
  columns: ProColumnDef<T>[]
  data: T
  column?: number // 一行展示几列，默认 3
  border?: boolean
  size?: 'large' | 'default' | 'small'
  descriptionsProps?: Partial<ElDescriptionsProps>
}
```

### 字段可见性控制

```typescript
// ProColumnDef 中控制各场景可见性的字段：
{
  hideInTable: boolean // true 时不在 ProTable 中展示
  hideInSearch: boolean // true 时不生成搜索控件
  hideInDescriptions: boolean // true 时不在 ProDescriptions 中展示
}
```
