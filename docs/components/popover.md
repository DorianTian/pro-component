---
outline: deep
---

# Popover 弹出框

基于 Element Plus `ElPopover` 的统一封装。统一 shadcn-vue 视觉风格，API 同 Element Plus。

## 基础用法

```vue
<script setup>
import { Popover } from '@pro/popover'
</script>

<template>
  <Popover trigger="hover" content="这是一段提示内容">
    <template #reference>
      <el-button>悬停触发</el-button>
    </template>
  </Popover>
</template>
```

## API

完整 Props/Events/Slots 同 [Element Plus Popover](https://element-plus.org/zh-CN/component/popover.html)，所有原生属性均可透传。
