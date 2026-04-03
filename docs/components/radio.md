---
outline: deep
---

# Radio 单选框

基于 Element Plus `ElRadio` / `ElRadioGroup` / `ElRadioButton` 的统一封装。统一 shadcn-vue 视觉风格，API 同 Element Plus。

## 导出组件

- `Radio` -- 单个单选框
- `RadioGroup` -- 单选框组
- `RadioButton` -- 按钮式单选框

## 基础用法

基本的单选框用法。

<demo vue="../../packages/radio/demos/basic.vue" />

## 禁用状态

通过 `disabled` 属性设置为禁用状态。

<demo vue="../../packages/radio/demos/disabled.vue" />

## 单选组

结合 `RadioGroup` 管理一组单选框。

<demo vue="../../packages/radio/demos/group.vue" />

## 按钮样式

使用 `RadioButton` 组件以按钮形式展示单选框。

<demo vue="../../packages/radio/demos/button.vue" />

## 不同尺寸

通过 `size` 属性控制尺寸，可选值为 `large`、`default`、`small`。

<demo vue="../../packages/radio/demos/sizes.vue" />

## 带边框

设置 `border` 属性可为单选框添加边框。

<demo vue="../../packages/radio/demos/border.vue" />

## API

### Radio Props

| 属性名                  | 说明                                            | 类型                              | 默认值  |
| ----------------------- | ----------------------------------------------- | --------------------------------- | ------- |
| `model-value / v-model` | 绑定值                                          | `string \| number \| boolean`     | —       |
| `label`                 | 单选框对应的值（搭配 RadioGroup 使用）          | `string \| number \| boolean`     | —       |
| `value`                 | 单选框对应的值（同 `label`，Element Plus 2.6+） | `string \| number \| boolean`     | —       |
| `disabled`              | 是否禁用                                        | `boolean`                         | `false` |
| `border`                | 是否显示边框                                    | `boolean`                         | `false` |
| `size`                  | 尺寸                                            | `'large' \| 'default' \| 'small'` | —       |

### RadioGroup Props

| 属性名                  | 说明                           | 类型                              | 默认值      |
| ----------------------- | ------------------------------ | --------------------------------- | ----------- |
| `model-value / v-model` | 绑定值                         | `string \| number \| boolean`     | —           |
| `size`                  | 尺寸                           | `'large' \| 'default' \| 'small'` | —           |
| `disabled`              | 是否禁用                       | `boolean`                         | `false`     |
| `text-color`            | 按钮形式激活时的文字颜色       | `string`                          | `'#ffffff'` |
| `fill`                  | 按钮形式激活时的填充色和边框色 | `string`                          | `'#409eff'` |

### Events

| 事件名   | 说明             | 参数           |
| -------- | ---------------- | -------------- |
| `change` | 绑定值变化时触发 | `(value: any)` |

完整属性参考 [Element Plus Radio](https://element-plus.org/zh-CN/component/radio.html)。
