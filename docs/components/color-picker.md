---
outline: deep
---

# ColorPicker 颜色选择器

基于 Element Plus `ElColorPicker` 的统一封装。统一 shadcn-vue 视觉风格，API 同 Element Plus。

::: info Pro 增强

- **Design Token** — 自动集成 shadcn New York 视觉规范
- **统一导入** — `import { ColorPicker } from '@pro/color-picker'`，与 Pro 组件生态统一
  :::

## 基础用法

最简单的颜色选择器用法。

<demo vue="../../packages/color-picker/demos/basic.vue" />

## 禁用状态

通过 `disabled` 属性禁用颜色选择器。

<demo vue="../../packages/color-picker/demos/disabled.vue" />

## 不同尺寸

通过 `size` 属性设置不同尺寸。

<demo vue="../../packages/color-picker/demos/sizes.vue" />

## 透明度

设置 `show-alpha` 启用透明度选择。

<demo vue="../../packages/color-picker/demos/alpha.vue" />

## 预定义颜色

通过 `predefine` 属性提供预定义的颜色选项，方便快速选取。

<demo vue="../../packages/color-picker/demos/predefine.vue" />

## 颜色格式

通过 `color-format` 属性指定颜色输出格式（hex / rgb / hsl / hsv）。

<demo vue="../../packages/color-picker/demos/formats.vue" />

## API

### Props

| 属性                   | 类型                               | 默认值      | 说明               |
| ---------------------- | ---------------------------------- | ----------- | ------------------ |
| `modelValue / v-model` | `string`                           | —           | 绑定值             |
| `disabled`             | `boolean`                          | `false`     | 是否禁用           |
| `size`                 | `'large' \| 'default' \| 'small'`  | `'default'` | 尺寸               |
| `showAlpha`            | `boolean`                          | `false`     | 是否支持透明度选择 |
| `colorFormat`          | `'hex' \| 'rgb' \| 'hsl' \| 'hsv'` | `'hex'`     | 颜色格式           |
| `predefine`            | `string[]`                         | —           | 预定义颜色         |
| `tabindex`             | `number`                           | `0`         | tabindex           |

### Events

| 事件                | 参数              | 说明                     |
| ------------------- | ----------------- | ------------------------ |
| `update:modelValue` | `(value: string)` | 颜色改变时触发           |
| `change`            | `(value: string)` | 颜色改变时触发           |
| `activeChange`      | `(value: string)` | 面板中当前颜色变化时触发 |

完整 Props/Events/Slots 同 [Element Plus ColorPicker](https://element-plus.org/zh-CN/component/color-picker.html)，所有原生属性均可透传。
