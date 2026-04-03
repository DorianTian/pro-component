---
outline: deep
---

# TimePicker 时间选择器

基于 Element Plus `ElTimePicker` 的统一封装，默认启用 `clearable`。

## 默认配置

| 属性        | 默认值 | 说明       |
| ----------- | ------ | ---------- |
| `clearable` | `true` | 默认可清除 |

## 基础用法

最简单的时间选择器用法。

<demo vue="../../packages/time-picker/demos/basic.vue" />

## 禁用状态

通过 `disabled` 属性禁用时间选择器。

<demo vue="../../packages/time-picker/demos/disabled.vue" />

## 时间格式

通过 `format` 属性自定义时间显示格式。

<demo vue="../../packages/time-picker/demos/format.vue" />

## 默认值

通过 `default-value` 属性设置面板打开时默认显示的时间。

<demo vue="../../packages/time-picker/demos/default-value.vue" />

## 时间范围

设置 `is-range` 选择时间范围。

<demo vue="../../packages/time-picker/demos/range.vue" />

## 步长控制

通过 `step` 相关属性控制时/分/秒的选择步长。

<demo vue="../../packages/time-picker/demos/step.vue" />

## 箭头控制

设置 `arrow-control` 使用箭头按钮来选择时间。

<demo vue="../../packages/time-picker/demos/arrow-control.vue" />

## API

### Props

| 属性                   | 类型                              | 默认值       | 说明               |
| ---------------------- | --------------------------------- | ------------ | ------------------ |
| `modelValue / v-model` | `string \| Date \| [Date, Date]`  | —            | 绑定值             |
| `isRange`              | `boolean`                         | `false`      | 是否为时间范围选择 |
| `format`               | `string`                          | `'HH:mm:ss'` | 显示格式           |
| `clearable`            | `boolean`                         | `true`       | 是否可清除         |
| `disabled`             | `boolean`                         | `false`      | 是否禁用           |
| `size`                 | `'large' \| 'default' \| 'small'` | `'default'`  | 尺寸               |
| `placeholder`          | `string`                          | —            | 占位文本           |
| `startPlaceholder`     | `string`                          | —            | 范围选择时开始占位 |
| `endPlaceholder`       | `string`                          | —            | 范围选择时结束占位 |
| `rangeSeparator`       | `string`                          | `'-'`        | 范围分隔符         |
| `defaultValue`         | `Date \| [Date, Date]`            | —            | 默认显示时间       |
| `arrowControl`         | `boolean`                         | `false`      | 是否使用箭头控制   |

### Events

| 事件                | 参数                      | 说明                |
| ------------------- | ------------------------- | ------------------- |
| `update:modelValue` | `(value: string \| Date)` | 值改变时触发        |
| `change`            | `(value: string \| Date)` | 值改变时触发        |
| `blur`              | `(event: FocusEvent)`     | 失焦时触发          |
| `focus`             | `(event: FocusEvent)`     | 聚焦时触发          |
| `visibleChange`     | `(visible: boolean)`      | 面板显示/隐藏时触发 |

完整 Props/Events/Slots 同 [Element Plus TimePicker](https://element-plus.org/zh-CN/component/time-picker.html)，所有原生属性均可透传。
