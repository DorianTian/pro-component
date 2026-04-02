---
outline: deep
---

# Dialog 对话框

基于 Element Plus `ElDialog` 的统一封装，默认挂载到 body 并启用拖拽。

## 默认配置

| 属性           | 默认值 | 说明                          |
| -------------- | ------ | ----------------------------- |
| `appendToBody` | `true` | 默认挂载到 body，避免层级问题 |
| `draggable`    | `true` | 默认可拖拽                    |

## 基础用法

<demo vue="../../packages/dialog/demos/basic.vue" />

## API

完整 Props/Events/Slots 同 [Element Plus Dialog](https://element-plus.org/zh-CN/component/dialog.html)，所有原生属性均可透传。
