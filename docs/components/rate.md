---
outline: deep
---

# Rate 评分

基于 Element Plus `ElRate` 的统一封装。统一 shadcn-vue 视觉风格，API 同 Element Plus。

## 基础用法

最简单的评分组件用法。

<demo vue="../../packages/rate/demos/basic.vue" />

## 只读

通过 `disabled` 属性设置为只读模式，常用于展示场景。

<demo vue="../../packages/rate/demos/disabled.vue" />

## 半星

设置 `allow-half` 允许选择半星，提供更精细的评分粒度。

<demo vue="../../packages/rate/demos/allow-half.vue" />

## 辅助文字

为每个评分等级添加辅助文字说明。

<demo vue="../../packages/rate/demos/show-text.vue" />

## 自定义图标

使用 `void-icon` 和 `active-icon` 自定义评分图标。

<demo vue="../../packages/rate/demos/custom-icon.vue" />

## 自定义颜色

通过 `colors` 属性为不同评分区间设置不同颜色。

<demo vue="../../packages/rate/demos/colors.vue" />

## 不同尺寸

支持不同尺寸的评分组件。

<demo vue="../../packages/rate/demos/sizes.vue" />

## API

### Props

| 属性                   | 类型                                       | 默认值      | 说明             |
| ---------------------- | ------------------------------------------ | ----------- | ---------------- |
| `modelValue / v-model` | `number`                                   | `0`         | 绑定值           |
| `max`                  | `number`                                   | `5`         | 最大分值         |
| `disabled`             | `boolean`                                  | `false`     | 是否只读         |
| `allowHalf`            | `boolean`                                  | `false`     | 是否允许半选     |
| `size`                 | `'large' \| 'default' \| 'small'`          | `'default'` | 尺寸             |
| `colors`               | `string[] \| Record<number, string>`       | —           | 自定义颜色       |
| `voidColor`            | `string`                                   | —           | 未选中时颜色     |
| `icons`                | `Component[] \| Record<number, Component>` | —           | 图标组件         |
| `voidIcon`             | `string \| Component`                      | —           | 未选中时图标     |
| `texts`                | `string[]`                                 | —           | 辅助文字数组     |
| `showText`             | `boolean`                                  | `false`     | 是否显示辅助文字 |
| `showScore`            | `boolean`                                  | `false`     | 是否显示当前分数 |
| `textColor`            | `string`                                   | —           | 辅助文字颜色     |
| `scoreTemplate`        | `string`                                   | `'{value}'` | 分数模板         |

### Events

| 事件                | 参数              | 说明           |
| ------------------- | ----------------- | -------------- |
| `update:modelValue` | `(value: number)` | 分值改变时触发 |
| `change`            | `(value: number)` | 分值改变时触发 |

完整 Props/Events/Slots 同 [Element Plus Rate](https://element-plus.org/zh-CN/component/rate.html)，所有原生属性均可透传。
