---
outline: deep
---

# Cascader 级联选择器

基于 Element Plus `ElCascader` 的统一封装，默认启用 `clearable` 和 `filterable`。

## 默认配置

| 属性         | 默认值 | 说明           |
| ------------ | ------ | -------------- |
| `clearable`  | `true` | 默认可清除     |
| `filterable` | `true` | 默认可搜索过滤 |

## 基础用法

```vue
<script setup>
import { ref } from 'vue'
import { Cascader } from '@pro/cascader'

const value = ref([])
const options = [
  {
    label: '浙江',
    value: 'zj',
    children: [
      { label: '杭州', value: 'hz' },
      { label: '宁波', value: 'nb' },
    ],
  },
]
</script>

<template>
  <Cascader v-model="value" :options="options" placeholder="请选择" />
</template>
```

## API

完整 Props/Events/Slots 同 [Element Plus Cascader](https://element-plus.org/zh-CN/component/cascader.html)，所有原生属性均可透传。
