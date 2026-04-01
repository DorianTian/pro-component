---
outline: deep
---

# Pagination 分页

基于 Element Plus `ElPagination` 的企业级封装，预置完整分页布局和常用页码选项。

## 企业级默认配置

| 属性        | 默认值                                      | 说明             |
| ----------- | ------------------------------------------- | ---------------- |
| `layout`    | `'total, sizes, prev, pager, next, jumper'` | 完整分页布局     |
| `pageSizes` | `[10, 20, 50, 100]`                         | 常用每页条数选项 |

## 基础用法

```vue
<script setup>
import { ref } from 'vue'
import { Pagination } from '@pro/pagination'

const currentPage = ref(1)
const pageSize = ref(20)
</script>

<template>
  <Pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :total="200" />
</template>
```

## API

完整 Props/Events/Slots 同 [Element Plus Pagination](https://element-plus.org/zh-CN/component/pagination.html)，所有原生属性均可透传。
