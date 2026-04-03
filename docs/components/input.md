---
outline: deep
---

# Input 输入框

基于 Element Plus `ElInput` 的统一封装，默认启用 `clearable`。

## 默认配置

| 属性        | 默认值 | 说明       |
| ----------- | ------ | ---------- |
| `clearable` | `true` | 默认可清除 |

## 基础用法

基本的输入框用法。

<demo vue="../../packages/input/demos/basic.vue" />

## 禁用状态

通过 `disabled` 属性设置输入框为禁用状态。

<demo vue="../../packages/input/demos/disabled.vue" />

## 不同尺寸

通过 `size` 属性控制输入框尺寸，可选值为 `large`、`default`、`small`。

<demo vue="../../packages/input/demos/sizes.vue" />

## 前缀与后缀图标

通过 `prefix-icon` 和 `suffix-icon` 属性或对应插槽为输入框添加图标。

<demo vue="../../packages/input/demos/prefix-suffix.vue" />

## 文本域

设置 `type="textarea"` 将输入框渲染为多行文本域。

<demo vue="../../packages/input/demos/textarea.vue" />

## 密码输入框

设置 `type="password"` 并开启 `show-password` 可切换密码可见性。

<demo vue="../../packages/input/demos/password.vue" />

## 字数限制

通过 `maxlength` 和 `show-word-limit` 属性显示剩余可输入字数。

<demo vue="../../packages/input/demos/word-limit.vue" />

## 复合型输入框

通过 `prepend` 和 `append` 插槽实现前置或后置内容的复合输入框。

<demo vue="../../packages/input/demos/composite.vue" />

## 可清除

默认已启用 `clearable`，输入内容后显示清除按钮。

<demo vue="../../packages/input/demos/clearable.vue" />

## 格式化

通过 `formatter` 和 `parser` 属性自定义输入值的显示和存储格式。

<demo vue="../../packages/input/demos/formatter.vue" />

## API

### Props

| 属性名                  | 说明                         | 类型                                              | 默认值   |
| ----------------------- | ---------------------------- | ------------------------------------------------- | -------- |
| `model-value / v-model` | 绑定值                       | `string \| number`                                | —        |
| `type`                  | 输入框类型                   | `string`                                          | `'text'` |
| `maxlength`             | 最大输入长度                 | `string \| number`                                | —        |
| `minlength`             | 最小输入长度                 | `string \| number`                                | —        |
| `show-word-limit`       | 是否显示字数统计             | `boolean`                                         | `false`  |
| `placeholder`           | 占位文本                     | `string`                                          | —        |
| `clearable`             | 是否可清空                   | `boolean`                                         | `true`   |
| `formatter`             | 指定输入值的格式化函数       | `(value: string \| number) => string`             | —        |
| `parser`                | 指定从格式化器输入中提取的值 | `(value: string) => string`                       | —        |
| `show-password`         | 是否显示切换密码图标         | `boolean`                                         | `false`  |
| `disabled`              | 是否禁用                     | `boolean`                                         | `false`  |
| `size`                  | 输入框尺寸                   | `'large' \| 'default' \| 'small'`                 | —        |
| `prefix-icon`           | 前缀图标                     | `string \| Component`                             | —        |
| `suffix-icon`           | 后缀图标                     | `string \| Component`                             | —        |
| `rows`                  | textarea 行数                | `number`                                          | `2`      |
| `autosize`              | textarea 高度自适应          | `boolean \| { minRows: number; maxRows: number }` | `false`  |
| `readonly`              | 是否只读                     | `boolean`                                         | `false`  |
| `resize`                | 是否可拖拽缩放               | `'none' \| 'both' \| 'horizontal' \| 'vertical'`  | —        |

### Events

| 事件名   | 说明               | 参数                        |
| -------- | ------------------ | --------------------------- |
| `input`  | 值改变时触发       | `(value: string \| number)` |
| `change` | 值改变且失焦时触发 | `(value: string \| number)` |
| `focus`  | 获取焦点时触发     | `(event: FocusEvent)`       |
| `blur`   | 失去焦点时触发     | `(event: FocusEvent)`       |
| `clear`  | 点击清除按钮时触发 | —                           |

### Slots

| 插槽名    | 说明           |
| --------- | -------------- |
| `prefix`  | 输入框头部内容 |
| `suffix`  | 输入框尾部内容 |
| `prepend` | 输入框前置内容 |
| `append`  | 输入框后置内容 |

完整属性参考 [Element Plus Input](https://element-plus.org/zh-CN/component/input.html)。
