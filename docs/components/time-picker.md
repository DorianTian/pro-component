---
outline: deep
---

# TimePicker 时间选择器

基于 Element Plus `ElTimePicker` 的企业级封装，默认启用 `clearable`。

## 企业级默认配置

| 属性        | 默认值 | 说明       |
| ----------- | ------ | ---------- |
| `clearable` | `true` | 默认可清除 |

## 基础用法

```vue
<script setup>
import { ref } from 'vue'
import { TimePicker } from '@pro/time-picker'

const value = ref('')
</script>

<template>
  <TimePicker v-model="value" placeholder="请选择时间" />
</template>
```

## API

完整 Props/Events/Slots 同 [Element Plus TimePicker](https://element-plus.org/zh-CN/component/time-picker.html)，所有原生属性均可透传。
