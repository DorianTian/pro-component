---
outline: deep
---

# Rate 评分

基于 Element Plus `ElRate` 的企业级封装。统一 shadcn-vue 视觉风格，API 同 Element Plus。

## 基础用法

```vue
<script setup>
import { ref } from 'vue'
import { Rate } from '@pro/rate'

const value = ref(3)
</script>

<template>
  <Rate v-model="value" />
</template>
```

## API

完整 Props/Events/Slots 同 [Element Plus Rate](https://element-plus.org/zh-CN/component/rate.html)，所有原生属性均可透传。
