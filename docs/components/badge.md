---
outline: deep
---

# Badge 徽章

基于 Element Plus `ElBadge` 的统一封装。统一 shadcn-vue 视觉风格，API 同 Element Plus。

::: info Pro 增强

- **Design Token** — 自动集成 shadcn New York 视觉规范（字重优化）
- **统一导入** — `import { Badge } from '@pro/badge'`，与 Pro 组件生态统一
  :::

## 基础用法

<demo vue="../../packages/badge/demos/basic.vue" />

## 最大值

超出 `max` 时显示 `max+`。

<demo vue="../../packages/badge/demos/max.vue" />

## 小圆点

以红点形式提醒用户有新内容。

<demo vue="../../packages/badge/demos/dot.vue" />

## 自定义内容

`value` 可以传入字符串。

<demo vue="../../packages/badge/demos/custom.vue" />

## 不同类型

通过 `type` 设置不同颜色。

<demo vue="../../packages/badge/demos/types.vue" />

## 条件隐藏

通过 `hidden` 动态控制徽章显隐。

<demo vue="../../packages/badge/demos/hidden.vue" />

## API

### Props

| 属性     | 类型                                                        | 默认值     | 说明                    |
| -------- | ----------------------------------------------------------- | ---------- | ----------------------- |
| `value`  | `string \| number`                                          | —          | 显示值                  |
| `max`    | `number`                                                    | `99`       | 最大值，超出显示 `max+` |
| `is-dot` | `boolean`                                                   | `false`    | 是否为小圆点模式        |
| `hidden` | `boolean`                                                   | `false`    | 是否隐藏徽章            |
| `type`   | `'primary' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `'danger'` | 徽章类型                |

### Slots

| 名称      | 说明           |
| --------- | -------------- |
| `default` | 徽章包裹的内容 |

完整 Props/Events/Slots 同 [Element Plus Badge](https://element-plus.org/zh-CN/component/badge.html)，所有原生属性均可透传。
