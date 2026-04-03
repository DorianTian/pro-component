---
outline: deep
---

# Slider 滑块

基于 Element Plus `ElSlider` 的统一封装。统一 shadcn-vue 视觉风格，API 同 Element Plus。

::: info Pro 增强
- **Design Token** — 自动集成 shadcn New York 视觉规范
- **ValueType 生态** — `valueType: 'slider'` 在 ProTable / ProForm 中统一驱动渲染
:::

## 基础用法

基本的滑块用法。

<demo vue="../../packages/slider/demos/basic.vue" />

## 禁用状态

通过 `disabled` 属性设置为禁用状态。

<demo vue="../../packages/slider/demos/disabled.vue" />

## 离散值

设置 `step` 属性控制滑块的步进值，并可通过 `show-stops` 显示间断点。

<demo vue="../../packages/slider/demos/step.vue" />

## 范围选择

设置 `range` 属性启用范围选择模式，绑定值为 `[min, max]` 数组。

<demo vue="../../packages/slider/demos/range.vue" />

## 垂直模式

设置 `vertical` 属性为 `true` 并指定 `height` 启用垂直方向滑块。

<demo vue="../../packages/slider/demos/vertical.vue" />

## 标记

通过 `marks` 属性在滑块上添加固定标记点。

<demo vue="../../packages/slider/demos/marks.vue" />

## 带输入框

设置 `show-input` 属性在滑块旁显示一个数字输入框。

<demo vue="../../packages/slider/demos/input.vue" />

## 格式化提示

通过 `format-tooltip` 属性自定义滑块提示的显示格式。

<demo vue="../../packages/slider/demos/format.vue" />

## API

### Props

| 属性名                  | 说明                                 | 类型                                                                | 默认值  |
| ----------------------- | ------------------------------------ | ------------------------------------------------------------------- | ------- |
| `model-value / v-model` | 绑定值                               | `number \| number[]`                                                | `0`     |
| `min`                   | 最小值                               | `number`                                                            | `0`     |
| `max`                   | 最大值                               | `number`                                                            | `100`   |
| `disabled`              | 是否禁用                             | `boolean`                                                           | `false` |
| `step`                  | 步长                                 | `number`                                                            | `1`     |
| `show-input`            | 是否显示输入框（仅非范围选择时可用） | `boolean`                                                           | `false` |
| `show-input-controls`   | 输入框是否显示控制按钮               | `boolean`                                                           | `true`  |
| `size`                  | 尺寸（含输入框）                     | `'large' \| 'default' \| 'small'`                                   | —       |
| `input-size`            | 输入框尺寸                           | `'large' \| 'default' \| 'small'`                                   | —       |
| `show-stops`            | 是否显示间断点                       | `boolean`                                                           | `false` |
| `show-tooltip`          | 是否显示提示                         | `boolean`                                                           | `true`  |
| `format-tooltip`        | 格式化提示内容                       | `(value: number) => number \| string`                               | —       |
| `range`                 | 是否为范围选择                       | `boolean`                                                           | `false` |
| `vertical`              | 是否竖向模式                         | `boolean`                                                           | `false` |
| `height`                | 竖向模式下的高度                     | `string`                                                            | —       |
| `marks`                 | 标记                                 | `Record<number, string \| { style: CSSProperties; label: string }>` | —       |
| `debounce`              | 输入时的去抖延迟（毫秒）             | `number`                                                            | `300`   |
| `placement`             | 提示的弹出位置                       | `string`                                                            | `'top'` |

### Events

| 事件名   | 说明                       | 参数                          |
| -------- | -------------------------- | ----------------------------- |
| `change` | 值改变时触发（松开鼠标后） | `(value: number \| number[])` |
| `input`  | 拖动时实时触发             | `(value: number \| number[])` |

完整属性参考 [Element Plus Slider](https://element-plus.org/zh-CN/component/slider.html)。
