---
outline: deep
---

# DatePicker 日期选择器

基于 Element Plus `ElDatePicker` 的企业级封装，默认启用 `clearable` 并统一日期格式。

## 企业级默认配置

| 属性          | 默认值         | 说明               |
| ------------- | -------------- | ------------------ |
| `clearable`   | `true`         | 默认可清除         |
| `valueFormat` | `'YYYY-MM-DD'` | 统一日期字符串格式 |

## 基础用法

```vue
<script setup>
import { ref } from 'vue'
import { DatePicker } from '@pro/date-picker'

const value = ref('')
</script>

<template>
  <DatePicker v-model="value" placeholder="请选择日期" />
</template>
```

## API

完整 Props/Events/Slots 同 [Element Plus DatePicker](https://element-plus.org/zh-CN/component/date-picker.html)，所有原生属性均可透传。
