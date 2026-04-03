---
outline: deep
---

# Tooltip 文字提示

基于 Element Plus `ElTooltip` 的统一封装，默认延迟显示避免误触。

::: info Pro 增强
相比原生 `ElTooltip`，Pro Tooltip 提供：
- **智能默认值** — `showAfter` 默认 300ms，避免鼠标快速划过时频繁弹出
- **Design Token** — 自动集成 shadcn New York 视觉规范
:::

## 默认配置

| 属性        | 默认值 | 说明                              |
| ----------- | ------ | --------------------------------- |
| `showAfter` | `300`  | 延迟 300ms 显示，避免鼠标划过误触 |

## 基础用法

<demo vue="../../packages/tooltip/demos/basic.vue" />

## 弹出方向

支持 12 种弹出方向。

<demo vue="../../packages/tooltip/demos/placement.vue" />

## 触发方式

支持 hover、click、focus、contextmenu。

<demo vue="../../packages/tooltip/demos/trigger.vue" />

## 主题

深色和浅色主题。

<demo vue="../../packages/tooltip/demos/theme.vue" />

## 禁用

通过 `disabled` 属性禁用 Tooltip。

<demo vue="../../packages/tooltip/demos/disabled.vue" />

## 富文本内容

通过 `raw-content` 渲染 HTML，或使用 `content` 插槽。

<demo vue="../../packages/tooltip/demos/raw-content.vue" />

## 显示延迟

自定义 `show-after` 和 `hide-after`。

<demo vue="../../packages/tooltip/demos/transition.vue" />

## API

### Props

| 属性          | 类型                                             | 默认值    | 说明                |
| ------------- | ------------------------------------------------ | --------- | ------------------- |
| `content`     | `string`                                         | —         | 提示内容            |
| `placement`   | `Placement`                                      | `'top'`   | 弹出方向            |
| `trigger`     | `'hover' \| 'click' \| 'focus' \| 'contextmenu'` | `'hover'` | 触发方式            |
| `effect`      | `'dark' \| 'light'`                              | `'dark'`  | 主题                |
| `disabled`    | `boolean`                                        | `false`   | 是否禁用            |
| `show-after`  | `number`                                         | `300`     | 延迟显示（ms）      |
| `hide-after`  | `number`                                         | `200`     | 延迟隐藏（ms）      |
| `raw-content` | `boolean`                                        | `false`   | content 是否为 HTML |

### Slots

| 名称      | 说明           |
| --------- | -------------- |
| `default` | 触发元素       |
| `content` | 自定义提示内容 |

完整 Props/Events/Slots 同 [Element Plus Tooltip](https://element-plus.org/zh-CN/component/tooltip.html)，所有原生属性均可透传。
