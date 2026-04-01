---
outline: deep
---

# Breadcrumb 面包屑

基于 Element Plus `ElBreadcrumb` / `ElBreadcrumbItem` 的企业级封装，预置分隔符。

## 导出组件

- `Breadcrumb` — 面包屑容器
- `BreadcrumbItem` — 面包屑项

## 企业级默认配置

| 属性        | 默认值 | 说明       |
| ----------- | ------ | ---------- |
| `separator` | `'/'`  | 默认分隔符 |

## 基础用法

```vue
<script setup>
import { Breadcrumb, BreadcrumbItem } from '@pro/breadcrumb'
</script>

<template>
  <Breadcrumb>
    <BreadcrumbItem to="/">首页</BreadcrumbItem>
    <BreadcrumbItem to="/list">列表</BreadcrumbItem>
    <BreadcrumbItem>详情</BreadcrumbItem>
  </Breadcrumb>
</template>
```

## API

完整 Props/Events/Slots 同 [Element Plus Breadcrumb](https://element-plus.org/zh-CN/component/breadcrumb.html)，所有原生属性均可透传。
