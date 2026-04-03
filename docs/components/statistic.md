---
outline: deep
---

# Statistic 统计数值

基于 Element Plus `ElStatistic` 的统一封装。统一 shadcn-vue 视觉风格，API 同 Element Plus。

## 基础用法

<demo vue="../../packages/statistic/demos/basic.vue" />

## 卡片式

在卡片中展示统计数值，适合仪表盘场景。

<demo vue="../../packages/statistic/demos/card.vue" />

## 前缀和后缀

通过插槽添加单位、图标等。

<demo vue="../../packages/statistic/demos/prefix-suffix.vue" />

## 倒计时

使用 Element Plus 的 `ElCountdown` 组件。

<demo vue="../../packages/statistic/demos/countdown.vue" />

## 统计组

多个统计数值横向排列。

<demo vue="../../packages/statistic/demos/group.vue" />

## 精度与千分位

`precision` 控制小数位数，`group-separator` 设置千分位分隔符。

<demo vue="../../packages/statistic/demos/decimal.vue" />

## API

### Props

| 属性                | 类型     | 默认值 | 说明         |
| ------------------- | -------- | ------ | ------------ |
| `value`             | `number` | `0`    | 数值         |
| `title`             | `string` | —      | 标题         |
| `precision`         | `number` | `0`    | 小数精度     |
| `group-separator`   | `string` | —      | 千分位分隔符 |
| `decimal-separator` | `string` | `.`    | 小数点符号   |
| `prefix`            | `string` | —      | 前缀         |
| `suffix`            | `string` | —      | 后缀         |

### Slots

| 名称     | 说明       |
| -------- | ---------- |
| `prefix` | 自定义前缀 |
| `suffix` | 自定义后缀 |
| `title`  | 自定义标题 |

完整 Props/Events/Slots 同 [Element Plus Statistic](https://element-plus.org/zh-CN/component/statistic.html)，所有原生属性均可透传。
