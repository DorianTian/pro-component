---
outline: deep
---

# Divider 分割线

基于 Element Plus `ElDivider` 的统一封装。统一 shadcn-vue 视觉风格，API 同 Element Plus。

## 基础用法

```vue
<script setup>
import { Divider } from '@pro/divider'
</script>

<template>
  <p>段落内容一</p>
  <Divider />
  <p>段落内容二</p>
  <Divider content-position="left">标题</Divider>
  <p>段落内容三</p>
</template>
```

## API

完整 Props/Events/Slots 同 [Element Plus Divider](https://element-plus.org/zh-CN/component/divider.html)，所有原生属性均可透传。
