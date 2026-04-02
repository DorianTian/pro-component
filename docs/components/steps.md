---
outline: deep
---

# Steps 步骤条

基于 Element Plus `ElSteps` / `ElStep` 的统一封装。统一 shadcn-vue 视觉风格，API 同 Element Plus。

## 导出组件

- `Steps` — 步骤条容器
- `Step` — 单个步骤

## 基础用法

```vue
<script setup>
import { ref } from 'vue'
import { Steps, Step } from '@pro/steps'

const active = ref(1)
</script>

<template>
  <Steps :active="active">
    <Step title="步骤 1" description="提交信息" />
    <Step title="步骤 2" description="审核中" />
    <Step title="步骤 3" description="完成" />
  </Steps>
</template>
```

## API

完整 Props/Events/Slots 同 [Element Plus Steps](https://element-plus.org/zh-CN/component/steps.html)，所有原生属性均可透传。
