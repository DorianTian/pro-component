---
outline: deep
---

# Checkbox 多选框

基于 Element Plus `ElCheckbox` / `ElCheckboxGroup` / `ElCheckboxButton` 的企业级封装。统一 shadcn-vue 视觉风格，API 同 Element Plus。

## 导出组件

- `Checkbox` — 单个多选框
- `CheckboxGroup` — 多选框组
- `CheckboxButton` — 按钮式多选框

## 基础用法

```vue
<script setup>
import { ref } from 'vue'
import { Checkbox, CheckboxGroup } from '@pro/checkbox'

const value = ref(['1'])
</script>

<template>
  <CheckboxGroup v-model="value">
    <Checkbox value="1">选项一</Checkbox>
    <Checkbox value="2">选项二</Checkbox>
    <Checkbox value="3">选项三</Checkbox>
  </CheckboxGroup>
</template>
```

## API

完整 Props/Events/Slots 同 [Element Plus Checkbox](https://element-plus.org/zh-CN/component/checkbox.html)，所有原生属性均可透传。
