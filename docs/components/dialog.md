---
outline: deep
---

# Dialog 对话框

基于 Element Plus `ElDialog` 的企业级封装，默认挂载到 body 并启用拖拽。

## 企业级默认配置

| 属性           | 默认值 | 说明                          |
| -------------- | ------ | ----------------------------- |
| `appendToBody` | `true` | 默认挂载到 body，避免层级问题 |
| `draggable`    | `true` | 默认可拖拽                    |

## 基础用法

```vue
<script setup>
import { ref } from 'vue'
import { Dialog } from '@pro/dialog'

const visible = ref(false)
</script>

<template>
  <el-button @click="visible = true">打开对话框</el-button>
  <Dialog v-model="visible" title="提示">
    <p>这是一段内容。</p>
  </Dialog>
</template>
```

## API

完整 Props/Events/Slots 同 [Element Plus Dialog](https://element-plus.org/zh-CN/component/dialog.html)，所有原生属性均可透传。
