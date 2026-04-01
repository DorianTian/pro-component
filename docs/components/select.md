---
outline: deep
---

# Select 选择器

基于 Element Plus `ElSelect` 的企业级封装，默认启用 `clearable` 和 `filterable`。

## 企业级默认配置

| 属性         | 默认值 | 说明           |
| ------------ | ------ | -------------- |
| `clearable`  | `true` | 默认可清除     |
| `filterable` | `true` | 默认可搜索过滤 |

## 基础用法

```vue
<script setup>
import { ref } from 'vue'
import { Select } from '@pro/select'

const value = ref('')
const options = [
  { label: '选项一', value: '1' },
  { label: '选项二', value: '2' },
  { label: '选项三', value: '3' },
]
</script>

<template>
  <Select v-model="value" :options="options" placeholder="请选择" />
</template>
```

## API

完整 Props/Events/Slots 同 [Element Plus Select](https://element-plus.org/zh-CN/component/select.html)，所有原生属性均可透传。
