---
outline: deep
---

# Pagination 分页

基于 Element Plus `ElPagination` 的统一封装，预置完整分页布局和常用页码选项。

## 默认配置

| 属性        | 默认值                                      | 说明             |
| ----------- | ------------------------------------------- | ---------------- |
| `layout`    | `'total, sizes, prev, pager, next, jumper'` | 完整分页布局     |
| `pageSizes` | `[10, 20, 50, 100]`                         | 常用每页条数选项 |

## 基础用法

<demo vue="../../packages/pagination/demos/basic.vue" />

## API

完整 Props/Events/Slots 同 [Element Plus Pagination](https://element-plus.org/zh-CN/component/pagination.html)，所有原生属性均可透传。
