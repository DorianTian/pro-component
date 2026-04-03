---
outline: deep
---

# ProTag 增强标签

基于 Element Plus `ElTag` 的增强封装。支持预设状态颜色（含圆点指示器）、processing 呼吸动画、自定义颜色、边框控制。

## 导出

```ts
import { ProTag } from '@pro/tag'
```

## 状态预设

全部 6 种状态，`processing` 自带呼吸动画。

<demo vue="../../packages/tag/demos/status.vue" />

## 基础用法

<demo vue="../../packages/tag/demos/basic.vue" />

## 自定义颜色

通过 `color` 自定义颜色，自动生成浅色背景和边框。

<demo vue="../../packages/tag/demos/custom-color.vue" />

## 可关闭

设置 `closable` 后可关闭，触发 `close` 事件。

<demo vue="../../packages/tag/demos/closable.vue" />

## 不同尺寸

通过 `size` 设置标签大小。

<demo vue="../../packages/tag/demos/sizes.vue" />

## 动态编辑

动态添加和移除标签。

<demo vue="../../packages/tag/demos/dynamic.vue" />

## 边框控制

通过 `bordered` 控制是否显示边框。

<demo vue="../../packages/tag/demos/bordered.vue" />

## API

### ProTag Props

| 属性       | 类型                                                                       | 默认值 | 说明                      |
| ---------- | -------------------------------------------------------------------------- | ------ | ------------------------- |
| `status`   | `'success' \| 'warning' \| 'error' \| 'info' \| 'processing' \| 'default'` | —      | 预设状态，显示状态圆点    |
| `color`    | `string`                                                                   | —      | 自定义颜色（覆盖 status） |
| `bordered` | `boolean`                                                                  | `true` | 是否显示边框              |

同时支持 Element Plus `ElTag` 的所有 Props（`size`、`closable`、`type`、`effect` 等）、Events 和 Slots。

### Slots

| 名称      | 说明         |
| --------- | ------------ |
| `default` | 标签文本内容 |

完整 Props/Events/Slots 同 [Element Plus Tag](https://element-plus.org/zh-CN/component/tag.html)。
