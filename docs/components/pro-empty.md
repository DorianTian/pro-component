---
outline: deep
---

# ProEmpty 空状态

增强型空状态组件，内置 4 种预设类型，每种配有专属 SVG 图标，支持自定义操作按钮。

::: info Pro 深度增强
ProEmpty 提供开箱即用的空状态解决方案：

- **5 种预设类型** — `no-data` / `no-result` / `error` / `no-permission` / `custom`，每种自带精美 SVG 图标
- **Error 重试** — `error` 类型自动显示重试按钮，触发 `@retry` 事件
- **自定义插槽** — 支持自定义图片、描述文字、操作区域
- **组合使用** — 可嵌入 Table、Card 等容器的空状态插槽
  :::

## 基础用法

最简单的空状态展示，默认类型为 `no-data`。

<demo vue="../../packages/empty/demos/basic.vue" />

## 预设类型

4 种预设类型对比：no-data、no-result、error、no-permission。

<demo vue="../../packages/empty/demos/types.vue" />

## 自定义图片和描述

使用 `type="custom"` 配合 `image` 和 `description` 属性，实现完全自定义的空状态。

<demo vue="../../packages/empty/demos/custom.vue" />

## 表格空状态

在 ElTable 的 `#empty` 插槽中使用 ProEmpty，替代默认的空状态展示。

<demo vue="../../packages/empty/demos/in-table.vue" />

## 错误重试

`type="error"` 时自动显示重试按钮，通过 `@retry` 事件处理重新请求。

<demo vue="../../packages/empty/demos/retry.vue" />

## API

### Props

| 属性          | 类型                                                                 | 默认值      | 说明                       |
| ------------- | -------------------------------------------------------------------- | ----------- | -------------------------- |
| `type`        | `'no-data' \| 'no-result' \| 'error' \| 'no-permission' \| 'custom'` | `'no-data'` | 预设类型                   |
| `description` | `string`                                                             | —           | 自定义描述（覆盖预设）     |
| `image`       | `string`                                                             | —           | 自定义图片 URL             |
| `imageSize`   | `number`                                                             | `120`       | 图片尺寸（px）             |
| `showRetry`   | `boolean`                                                            | `true`      | error 类型是否显示重试按钮 |

### Events

| 事件    | 说明               |
| ------- | ------------------ |
| `retry` | 点击重试按钮时触发 |

### Slots

| 插槽    | 说明           |
| ------- | -------------- |
| `image` | 自定义图标区域 |
| `extra` | 操作按钮区域   |
