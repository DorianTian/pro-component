---
outline: deep
---

# Upload 上传

基于 Element Plus `ElUpload` 的统一封装。统一 shadcn-vue 视觉风格，API 同 Element Plus。

## 基础用法

```vue
<script setup>
import { Upload } from '@pro/upload'
</script>

<template>
  <Upload action="/api/upload">
    <template #trigger>
      <el-button type="primary">点击上传</el-button>
    </template>
  </Upload>
</template>
```

## API

完整 Props/Events/Slots 同 [Element Plus Upload](https://element-plus.org/zh-CN/component/upload.html)，所有原生属性均可透传。
