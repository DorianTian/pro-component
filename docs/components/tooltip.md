---
outline: deep
---

# Tooltip 文字提示

基于 Element Plus `ElTooltip` 的企业级封装，默认延迟显示避免误触。

## 企业级默认配置

| 属性        | 默认值 | 说明                              |
| ----------- | ------ | --------------------------------- |
| `showAfter` | `300`  | 延迟 300ms 显示，避免鼠标划过误触 |

## 基础用法

```vue
<script setup>
import { Tooltip } from '@pro/tooltip'
</script>

<template>
  <Tooltip content="这是提示内容">
    <el-button>悬停查看</el-button>
  </Tooltip>
</template>
```

## API

完整 Props/Events/Slots 同 [Element Plus Tooltip](https://element-plus.org/zh-CN/component/tooltip.html)，所有原生属性均可透传。
