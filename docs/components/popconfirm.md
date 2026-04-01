---
outline: deep
---

# Popconfirm 气泡确认框

基于 Element Plus `ElPopconfirm` 的企业级封装。统一 shadcn-vue 视觉风格，API 同 Element Plus。

## 基础用法

```vue
<script setup>
import { Popconfirm } from '@pro/popconfirm'

const handleConfirm = () => {
  // 确认操作
}
</script>

<template>
  <Popconfirm title="确定删除吗？" @confirm="handleConfirm">
    <template #reference>
      <el-button type="danger">删除</el-button>
    </template>
  </Popconfirm>
</template>
```

## API

完整 Props/Events/Slots 同 [Element Plus Popconfirm](https://element-plus.org/zh-CN/component/popconfirm.html)，所有原生属性均可透传。
