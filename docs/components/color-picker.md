---
outline: deep
---

# ColorPicker 颜色选择器

基于 Element Plus `ElColorPicker` 的统一封装。统一 shadcn-vue 视觉风格，API 同 Element Plus。

## 基础用法

```vue
<script setup>
import { ref } from 'vue'
import { ColorPicker } from '@pro/color-picker'

const color = ref('#409EFF')
</script>

<template>
  <ColorPicker v-model="color" />
</template>
```

## API

完整 Props/Events/Slots 同 [Element Plus ColorPicker](https://element-plus.org/zh-CN/component/color-picker.html)，所有原生属性均可透传。
