---
outline: deep
---

# Switch 开关

基于 Element Plus `ElSwitch` 的统一封装。统一 shadcn-vue 视觉风格，API 同 Element Plus。

::: info Pro 增强
- **Design Token** — 自动集成 shadcn New York 视觉规范（选中色）
- **ValueType 生态** — `valueType: 'switch'` 在 ProTable / ProForm 中自动渲染开关控件，ProDescriptions 中渲染为状态指示器
:::

## 基础用法

基本的开关用法。

<demo vue="../../packages/switch/demos/basic.vue" />

## 禁用状态

通过 `disabled` 属性设置为禁用状态。

<demo vue="../../packages/switch/demos/disabled.vue" />

## 不同尺寸

通过 `size` 属性控制尺寸，可选值为 `large`、`default`、`small`。

<demo vue="../../packages/switch/demos/sizes.vue" />

## 文字与图标

通过 `active-text` / `inactive-text` 或 `active-action-icon` / `inactive-action-icon` 设置开关上的文字或图标。

<demo vue="../../packages/switch/demos/text.vue" />

## 加载状态

设置 `loading` 属性可让开关展示加载中状态。

<demo vue="../../packages/switch/demos/loading.vue" />

## 自定义值

通过 `active-value` 和 `inactive-value` 自定义开关的切换值。

<demo vue="../../packages/switch/demos/custom-value.vue" />

## 变更前确认

设置 `before-change` 钩子函数，返回 `false` 或 rejected Promise 可阻止切换。

<demo vue="../../packages/switch/demos/before-change.vue" />

## API

### Props

| 属性名                  | 说明                                      | 类型                                | 默认值  |
| ----------------------- | ----------------------------------------- | ----------------------------------- | ------- |
| `model-value / v-model` | 绑定值                                    | `boolean \| string \| number`       | —       |
| `disabled`              | 是否禁用                                  | `boolean`                           | `false` |
| `loading`               | 是否为加载中状态                          | `boolean`                           | `false` |
| `size`                  | 尺寸                                      | `'large' \| 'default' \| 'small'`   | —       |
| `width`                 | 开关宽度                                  | `number \| string`                  | —       |
| `inline-prompt`         | 是否在点内显示文字/图标                   | `boolean`                           | `false` |
| `active-icon`           | 打开时显示的图标                          | `string \| Component`               | —       |
| `inactive-icon`         | 关闭时显示的图标                          | `string \| Component`               | —       |
| `active-action-icon`    | 打开时滑块上显示的图标                    | `string \| Component`               | —       |
| `inactive-action-icon`  | 关闭时滑块上显示的图标                    | `string \| Component`               | —       |
| `active-text`           | 打开时的文字描述                          | `string`                            | —       |
| `inactive-text`         | 关闭时的文字描述                          | `string`                            | —       |
| `active-value`          | 打开时的值                                | `boolean \| string \| number`       | `true`  |
| `inactive-value`        | 关闭时的值                                | `boolean \| string \| number`       | `false` |
| `active-color`          | 打开时的背景色（已废弃，建议用 CSS 变量） | `string`                            | —       |
| `inactive-color`        | 关闭时的背景色（已废弃，建议用 CSS 变量） | `string`                            | —       |
| `before-change`         | 状态改变前的钩子，返回 false 可阻止       | `() => Promise<boolean> \| boolean` | —       |

### Events

| 事件名   | 说明         | 参数                                   |
| -------- | ------------ | -------------------------------------- |
| `change` | 值改变时触发 | `(value: boolean \| string \| number)` |

完整属性参考 [Element Plus Switch](https://element-plus.org/zh-CN/component/switch.html)。
