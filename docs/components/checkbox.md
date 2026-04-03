---
outline: deep
---

# Checkbox 多选框

基于 Element Plus `ElCheckbox` / `ElCheckboxGroup` / `ElCheckboxButton` 的统一封装。统一 shadcn-vue 视觉风格，API 同 Element Plus。

::: info Pro 增强
- **Design Token** — 自动集成 shadcn New York 视觉规范（选中色、圆角）
- **统一导出** — 同时导出 `Checkbox`、`CheckboxGroup`、`CheckboxButton` 三个组件
- **ValueType 生态** — `valueType: 'checkbox'` 在 ProTable / ProForm 中统一驱动渲染
:::

## 导出组件

- `Checkbox` -- 单个多选框
- `CheckboxGroup` -- 多选框组
- `CheckboxButton` -- 按钮式多选框

## 基础用法

基本的多选框用法。

<demo vue="../../packages/checkbox/demos/basic.vue" />

## 禁用状态

通过 `disabled` 属性设置为禁用状态。

<demo vue="../../packages/checkbox/demos/disabled.vue" />

## 多选组

结合 `CheckboxGroup` 管理一组多选框，绑定数组值。

<demo vue="../../packages/checkbox/demos/group.vue" />

## 全选与半选

结合 `indeterminate` 属性实现全选/半选控制。

<demo vue="../../packages/checkbox/demos/indeterminate.vue" />

## 按钮样式

使用 `CheckboxButton` 组件以按钮形式展示多选框。

<demo vue="../../packages/checkbox/demos/button.vue" />

## 不同尺寸

通过 `size` 属性控制尺寸，可选值为 `large`、`default`、`small`。

<demo vue="../../packages/checkbox/demos/sizes.vue" />

## 选择数量限制

通过 `CheckboxGroup` 的 `min` 和 `max` 属性限制可选数量。

<demo vue="../../packages/checkbox/demos/limit.vue" />

## 带边框

设置 `border` 属性可为多选框添加边框。

<demo vue="../../packages/checkbox/demos/border.vue" />

## API

### Checkbox Props

| 属性名                  | 说明                                          | 类型                                    | 默认值  |
| ----------------------- | --------------------------------------------- | --------------------------------------- | ------- |
| `model-value / v-model` | 绑定值                                        | `boolean`                               | —       |
| `label`                 | 选中状态的值（搭配 CheckboxGroup 使用）       | `string \| number \| boolean \| object` | —       |
| `value`                 | 选中状态的值（同 `label`，Element Plus 2.6+） | `string \| number \| boolean \| object` | —       |
| `true-value`            | 选中时的值                                    | `string \| number`                      | —       |
| `false-value`           | 未选中时的值                                  | `string \| number`                      | —       |
| `disabled`              | 是否禁用                                      | `boolean`                               | `false` |
| `border`                | 是否显示边框                                  | `boolean`                               | `false` |
| `size`                  | 尺寸                                          | `'large' \| 'default' \| 'small'`       | —       |
| `indeterminate`         | 是否为半选状态                                | `boolean`                               | `false` |
| `checked`               | 当前是否选中                                  | `boolean`                               | `false` |

### CheckboxGroup Props

| 属性名                  | 说明           | 类型                              | 默认值  |
| ----------------------- | -------------- | --------------------------------- | ------- |
| `model-value / v-model` | 绑定值         | `array`                           | `[]`    |
| `size`                  | 尺寸           | `'large' \| 'default' \| 'small'` | —       |
| `disabled`              | 是否禁用       | `boolean`                         | `false` |
| `min`                   | 最少可选数量   | `number`                          | —       |
| `max`                   | 最多可选数量   | `number`                          | —       |
| `tag`                   | 渲染的元素标签 | `string`                          | `'div'` |

### Events

| 事件名   | 说明             | 参数           |
| -------- | ---------------- | -------------- |
| `change` | 绑定值变化时触发 | `(value: any)` |

完整属性参考 [Element Plus Checkbox](https://element-plus.org/zh-CN/component/checkbox.html)。
