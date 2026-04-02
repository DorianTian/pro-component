---
outline: deep
---

# TreeSelect 树形选择器

基于 Element Plus `ElTreeSelect` 的统一封装，默认启用 `clearable` 和 `filterable`。

## 默认配置

| 属性         | 默认值 | 说明           |
| ------------ | ------ | -------------- |
| `clearable`  | `true` | 默认可清除     |
| `filterable` | `true` | 默认可搜索过滤 |

## 基础用法

```vue
<script setup>
import { ref } from 'vue'
import { TreeSelect } from '@pro/tree-select'

const value = ref('')
const data = [
  {
    label: '部门 A',
    value: 'a',
    children: [
      { label: '小组 A-1', value: 'a1' },
      { label: '小组 A-2', value: 'a2' },
    ],
  },
]
</script>

<template>
  <TreeSelect v-model="value" :data="data" placeholder="请选择" />
</template>
```

## API

完整 Props/Events/Slots 同 [Element Plus TreeSelect](https://element-plus.org/zh-CN/component/tree-select.html)，所有原生属性均可透传。
