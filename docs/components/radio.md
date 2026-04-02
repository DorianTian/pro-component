---
outline: deep
---

# Radio 单选框

基于 Element Plus `ElRadio` / `ElRadioGroup` / `ElRadioButton` 的统一封装。统一 shadcn-vue 视觉风格，API 同 Element Plus。

## 导出组件

- `Radio` — 单个单选框
- `RadioGroup` — 单选框组
- `RadioButton` — 按钮式单选框

## 基础用法

```vue
<script setup>
import { ref } from 'vue'
import { Radio, RadioGroup } from '@pro/radio'

const value = ref('1')
</script>

<template>
  <RadioGroup v-model="value">
    <Radio value="1">选项一</Radio>
    <Radio value="2">选项二</Radio>
    <Radio value="3">选项三</Radio>
  </RadioGroup>
</template>
```

## API

完整 Props/Events/Slots 同 [Element Plus Radio](https://element-plus.org/zh-CN/component/radio.html)，所有原生属性均可透传。
