---
outline: deep
---

# Slider 滑块

基于 Element Plus `ElSlider` 的统一封装。统一 shadcn-vue 视觉风格，API 同 Element Plus。

## 基础用法

```vue
<script setup>
import { ref } from 'vue'
import { Slider } from '@pro/slider'

const value = ref(50)
</script>

<template>
  <Slider v-model="value" />
</template>
```

## API

完整 Props/Events/Slots 同 [Element Plus Slider](https://element-plus.org/zh-CN/component/slider.html)，所有原生属性均可透传。
