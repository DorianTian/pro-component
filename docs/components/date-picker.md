---
outline: deep
---

# DatePicker 日期选择器

基于 Element Plus `ElDatePicker` 的统一封装，默认启用 `clearable` 并统一日期格式。

::: info Pro 增强
相比原生 `ElDatePicker`，Pro DatePicker 提供：
- **智能默认值** — `clearable` 默认开启，`valueFormat` 默认 `'YYYY-MM-DD'`（统一日期格式）
- **Design Token** — 自动集成 shadcn New York 视觉规范
- **ValueType 生态** — `valueType: 'date' | 'dateTime' | 'dateRange'` 在 ProTable / ProForm 中统一驱动渲染
:::

## 默认配置

| 属性          | 默认值         | 说明               |
| ------------- | -------------- | ------------------ |
| `clearable`   | `true`         | 默认可清除         |
| `valueFormat` | `'YYYY-MM-DD'` | 统一日期字符串格式 |

## 基础用法

最简单的日期选择器用法。

<demo vue="../../packages/date-picker/demos/basic.vue" />

## 禁用状态

通过 `disabled` 属性禁用日期选择器。

<demo vue="../../packages/date-picker/demos/disabled.vue" />

## 不同尺寸

通过 `size` 属性设置不同尺寸。

<demo vue="../../packages/date-picker/demos/sizes.vue" />

## 日期格式

通过 `format` 属性自定义日期显示格式。

<demo vue="../../packages/date-picker/demos/format.vue" />

## 默认值

通过 `default-value` 属性设置日历面板打开时默认显示的日期。

<demo vue="../../packages/date-picker/demos/default-value.vue" />

## 日期范围

设置 `type="daterange"` 选择日期范围。

<demo vue="../../packages/date-picker/demos/range.vue" />

## 快捷选项

通过 `shortcuts` 属性配置常用的快捷日期选项。

<demo vue="../../packages/date-picker/demos/shortcuts.vue" />

## 禁用日期

通过 `disabled-date` 函数自定义禁用的日期。

<demo vue="../../packages/date-picker/demos/disabled-date.vue" />

## 周选择器

设置 `type="week"` 切换为周选择模式。

<demo vue="../../packages/date-picker/demos/week.vue" />

## 月选择器

设置 `type="month"` 切换为月选择模式。

<demo vue="../../packages/date-picker/demos/month.vue" />

## 日期时间选择

设置 `type="datetime"` 同时选择日期和时间。

<demo vue="../../packages/date-picker/demos/datetime.vue" />

## API

### Props

| 属性                   | 类型                                                                                                               | 默认值         | 说明               |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------ | -------------- | ------------------ |
| `modelValue / v-model` | `string \| Date \| [string, string]`                                                                               | —              | 绑定值             |
| `type`                 | `'date' \| 'dates' \| 'week' \| 'month' \| 'year' \| 'daterange' \| 'monthrange' \| 'datetime' \| 'datetimerange'` | `'date'`       | 日期类型           |
| `format`               | `string`                                                                                                           | `'YYYY-MM-DD'` | 显示格式           |
| `valueFormat`          | `string`                                                                                                           | `'YYYY-MM-DD'` | 绑定值格式         |
| `clearable`            | `boolean`                                                                                                          | `true`         | 是否可清除         |
| `disabled`             | `boolean`                                                                                                          | `false`        | 是否禁用           |
| `size`                 | `'large' \| 'default' \| 'small'`                                                                                  | `'default'`    | 尺寸               |
| `placeholder`          | `string`                                                                                                           | —              | 占位文本           |
| `startPlaceholder`     | `string`                                                                                                           | —              | 范围选择时开始占位 |
| `endPlaceholder`       | `string`                                                                                                           | —              | 范围选择时结束占位 |
| `rangeSeparator`       | `string`                                                                                                           | `'-'`          | 范围分隔符         |
| `defaultValue`         | `Date \| [Date, Date]`                                                                                             | —              | 默认显示日期       |
| `shortcuts`            | `Array<{ text: string, value: Date \| Function }>`                                                                 | —              | 快捷选项           |
| `disabledDate`         | `(date: Date) => boolean`                                                                                          | —              | 禁用日期判断       |

### Events

| 事件                | 参数                      | 说明                |
| ------------------- | ------------------------- | ------------------- |
| `update:modelValue` | `(value: string \| Date)` | 值改变时触发        |
| `change`            | `(value: string \| Date)` | 值改变时触发        |
| `blur`              | `(event: FocusEvent)`     | 失焦时触发          |
| `focus`             | `(event: FocusEvent)`     | 聚焦时触发          |
| `visibleChange`     | `(visible: boolean)`      | 面板显示/隐藏时触发 |

### Slots

| 插槽              | 说明                 |
| ----------------- | -------------------- |
| `default`         | 自定义日期单元格内容 |
| `range-separator` | 自定义范围分隔符     |

完整 Props/Events/Slots 同 [Element Plus DatePicker](https://element-plus.org/zh-CN/component/date-picker.html)，所有原生属性均可透传。
