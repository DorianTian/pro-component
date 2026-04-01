---
outline: deep
---

# ProEmpty 空状态

增强型空状态组件，内置 4 种预设类型，每种配有专属 SVG 图标，支持自定义操作按钮。

## 预设类型

```vue
<template>
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px">
    <ProEmpty type="no-data" />
    <ProEmpty type="no-result" />
    <ProEmpty type="error" @retry="() => {}" />
    <ProEmpty type="no-permission" />
  </div>
</template>
```

## 自定义描述和操作

```vue
<template>
  <ProEmpty type="no-result" description="没有找到匹配的记录">
    <template #extra>
      <el-button type="primary" size="small">清除筛选</el-button>
    </template>
  </ProEmpty>
</template>
```

## 自定义图片

```vue
<template>
  <ProEmpty type="custom" image="/custom-illustration.svg" description="自定义空状态" />
</template>
```

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
