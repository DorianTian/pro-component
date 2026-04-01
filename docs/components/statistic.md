---
outline: deep
---

# Statistic 统计数值

基于 Element Plus `ElStatistic` 的企业级封装。统一 shadcn-vue 视觉风格，API 同 Element Plus。

## 基础用法

```vue
<script setup>
import { Statistic } from '@pro/statistic'
</script>

<template>
  <Statistic title="活跃用户" :value="268500" />
</template>
```

## API

完整 Props/Events/Slots 同 [Element Plus Statistic](https://element-plus.org/zh-CN/component/statistic.html)，所有原生属性均可透传。
