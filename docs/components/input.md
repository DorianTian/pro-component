---
outline: deep
---

# Input 输入框

基于 Element Plus `ElInput` 的统一封装，默认启用 `clearable`。

## 默认配置

| 属性        | 默认值 | 说明       |
| ----------- | ------ | ---------- |
| `clearable` | `true` | 默认可清除 |

## 基础用法

```vue
<script setup>
import { ref } from 'vue'
import { Input } from '@pro/input'

const value = ref('')
</script>

<template>
  <Input v-model="value" placeholder="请输入内容" />
</template>
```

## API

完整 Props/Events/Slots 同 [Element Plus Input](https://element-plus.org/zh-CN/component/input.html)，所有原生属性均可透传。
