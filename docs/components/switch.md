---
outline: deep
---

# Switch 开关

基于 Element Plus `ElSwitch` 的企业级封装。统一 shadcn-vue 视觉风格，API 同 Element Plus。

## 基础用法

```vue
<script setup>
import { ref } from 'vue'
import { Switch } from '@pro/switch'

const value = ref(false)
</script>

<template>
  <Switch v-model="value" />
</template>
```

## API

完整 Props/Events/Slots 同 [Element Plus Switch](https://element-plus.org/zh-CN/component/switch.html)，所有原生属性均可透传。
