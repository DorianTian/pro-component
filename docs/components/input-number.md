---
outline: deep
---

# InputNumber 数字输入框

基于 Element Plus `ElInputNumber` 的统一封装，默认右侧控制按钮布局。

## 默认配置

| 属性               | 默认值    | 说明             |
| ------------------ | --------- | ---------------- |
| `controlsPosition` | `'right'` | 控制按钮置于右侧 |

## 基础用法

基本的数字输入框用法。

<demo vue="../../packages/input-number/demos/basic.vue" />

## 禁用状态

通过 `disabled` 属性设置为禁用状态。

<demo vue="../../packages/input-number/demos/disabled.vue" />

## 不同尺寸

通过 `size` 属性控制尺寸，可选值为 `large`、`default`、`small`。

<demo vue="../../packages/input-number/demos/sizes.vue" />

## 自定义步长

通过 `step` 属性设置每次增减的步长值。

<demo vue="../../packages/input-number/demos/step.vue" />

## 精度

通过 `precision` 属性控制数值精度（小数位数）。

<demo vue="../../packages/input-number/demos/precision.vue" />

## 范围限制

通过 `min` 和 `max` 属性限制输入数值的范围。

<demo vue="../../packages/input-number/demos/range.vue" />

## 控制按钮位置

通过 `controls-position` 属性设置控制按钮的位置，默认为 `'right'`。

<demo vue="../../packages/input-number/demos/controls.vue" />

## 严格步长

设置 `step-strictly` 属性后，输入值只能为步长的倍数。

<demo vue="../../packages/input-number/demos/step-strictly.vue" />

## API

### Props

| 属性名                  | 说明                   | 类型                               | 默认值      |
| ----------------------- | ---------------------- | ---------------------------------- | ----------- |
| `model-value / v-model` | 绑定值                 | `number \| undefined`              | —           |
| `min`                   | 最小值                 | `number`                           | `-Infinity` |
| `max`                   | 最大值                 | `number`                           | `Infinity`  |
| `step`                  | 步长                   | `number`                           | `1`         |
| `step-strictly`         | 是否只能输入步长的倍数 | `boolean`                          | `false`     |
| `precision`             | 数值精度               | `number`                           | —           |
| `size`                  | 尺寸                   | `'large' \| 'default' \| 'small'`  | —           |
| `disabled`              | 是否禁用               | `boolean`                          | `false`     |
| `controls`              | 是否使用控制按钮       | `boolean`                          | `true`      |
| `controls-position`     | 控制按钮位置           | `'' \| 'right'`                    | `'right'`   |
| `placeholder`           | 占位文本               | `string`                           | —           |
| `value-on-clear`        | 清空时的值             | `number \| null \| 'min' \| 'max'` | `null`      |

### Events

| 事件名   | 说明           | 参数                                                                 |
| -------- | -------------- | -------------------------------------------------------------------- |
| `change` | 值改变时触发   | `(currentValue: number \| undefined, oldValue: number \| undefined)` |
| `blur`   | 失去焦点时触发 | `(event: FocusEvent)`                                                |
| `focus`  | 获取焦点时触发 | `(event: FocusEvent)`                                                |

完整属性参考 [Element Plus InputNumber](https://element-plus.org/zh-CN/component/input-number.html)。
