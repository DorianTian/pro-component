---
outline: deep
---

# Divider 分割线

基于 Element Plus `ElDivider` 的统一封装。统一 shadcn-vue 视觉风格，API 同 Element Plus。

## 基础用法

<demo vue="../../packages/divider/demos/basic.vue" />

## 带文字

通过 `content-position` 控制文字位置。

<demo vue="../../packages/divider/demos/text.vue" />

## 垂直分割线

设置 `direction="vertical"` 使用垂直分割线。

<demo vue="../../packages/divider/demos/vertical.vue" />

## 边框样式

通过 `border-style` 设置实线、虚线、点线等样式。

<demo vue="../../packages/divider/demos/style.vue" />

## API

### Props

| 属性               | 类型                                          | 默认值         | 说明     |
| ------------------ | --------------------------------------------- | -------------- | -------- |
| `direction`        | `'horizontal' \| 'vertical'`                  | `'horizontal'` | 方向     |
| `content-position` | `'left' \| 'center' \| 'right'`               | `'center'`     | 文字位置 |
| `border-style`     | `'solid' \| 'dashed' \| 'dotted' \| 'double'` | `'solid'`      | 边框样式 |

### Slots

| 名称      | 说明                 |
| --------- | -------------------- |
| `default` | 分割线中间的文字内容 |

完整 Props/Events/Slots 同 [Element Plus Divider](https://element-plus.org/zh-CN/component/divider.html)，所有原生属性均可透传。
