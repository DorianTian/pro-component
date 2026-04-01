---
outline: deep
---

# AutoComplete 自动补全

基于 Element Plus `ElAutocomplete` 的企业级封装。统一 shadcn-vue 视觉风格，API 同 Element Plus。

## 基础用法

```vue
<script setup>
import { ref } from 'vue'
import { AutoComplete } from '@pro/auto-complete'

const value = ref('')

const fetchSuggestions = (query: string, cb: (results: Array<{ value: string }>) => void) => {
  const results = [
    { value: 'vue' },
    { value: 'react' },
    { value: 'angular' },
  ].filter((item) => item.value.includes(query))
  cb(results)
}
</script>

<template>
  <AutoComplete v-model="value" :fetch-suggestions="fetchSuggestions" placeholder="请输入内容" />
</template>
```

## API

完整 Props/Events/Slots 同 [Element Plus Autocomplete](https://element-plus.org/zh-CN/component/autocomplete.html)，所有原生属性均可透传。
