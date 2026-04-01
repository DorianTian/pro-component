---
outline: deep
---

# ProEmpty 空状态

增强型空状态组件，内置 4 种预设类型，每种配有专属 SVG 图标，支持自定义操作按钮。

## 预设类型

<demo vue="../../packages/empty/demos/basic.vue" />

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
