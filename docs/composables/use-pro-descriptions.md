---
outline: deep
---

# useProDescriptions

`useProDescriptions` 管理 ProDescriptions 的数据加载和格式化逻辑。

## 基本用法

```typescript
import { useProDescriptions } from '@pro/hooks'

const {
  proDescriptionsProps, // 绑定到 <ProDescriptions /> 的 props
  data, // Ref<T> — 详情数据
  loading, // Ref<boolean> — 加载状态
  reload, // () => Promise<void> — 重新加载数据
  setData, // (data: T) => void — 直接设置数据
} = useProDescriptions({
  columns,
  request: async () => {
    const res = await fetch('/api/user/1')
    return res.json()
  },
})
```

## Options

```typescript
interface UseProDescriptionsOptions<T = Record<string, unknown>> {
  /** 列定义，复用 ProColumnDef */
  columns: ProColumnDef<T>[]

  /** 数据请求函数 */
  request?: () => Promise<T>

  /** 静态数据（与 request 二选一） */
  data?: T

  /** 是否挂载时自动请求，默认 true */
  immediate?: boolean
}
```

## 返回值

| 返回值                 | 类型                                | 说明                                     |
| ---------------------- | ----------------------------------- | ---------------------------------------- |
| `proDescriptionsProps` | `ComputedRef<ProDescriptionsProps>` | 绑定到 ProDescriptions 组件的 props 对象 |
| `data`                 | `Ref<T>`                            | 当前详情数据                             |
| `loading`              | `Ref<boolean>`                      | 加载状态                                 |
| `reload`               | `() => Promise<void>`               | 重新请求数据                             |
| `setData`              | `(data: T) => void`                 | 直接设置详情数据                         |

## 典型场景

### 与 ProTable 联动

点击表格行查看详情，共用同一份 `columns`：

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useProDescriptions } from '@pro/hooks'

const columns = [
  /* 共用的 columns 定义 */
]

const { proDescriptionsProps, setData } = useProDescriptions({
  columns,
  immediate: false,
})

// 从表格行点击事件获取数据
function handleRowClick(row: unknown) {
  setData(row)
  drawerVisible.value = true
}
</script>
```
