---
outline: deep
---

# Badge 徽章

基于 Element Plus `ElBadge` 的企业级封装。统一 shadcn-vue 视觉风格，API 同 Element Plus。

## 基础用法

```vue
<script setup>
import { Badge } from '@pro/badge'
</script>

<template>
  <Badge :value="12">
    <el-button>消息</el-button>
  </Badge>
</template>
```

## API

完整 Props/Events/Slots 同 [Element Plus Badge](https://element-plus.org/zh-CN/component/badge.html)，所有原生属性均可透传。
