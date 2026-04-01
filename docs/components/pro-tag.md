---
outline: deep
---

# ProTag 增强标签

基于 Element Plus `ElTag` 的增强封装，支持预设状态色板（success/warning/error/processing/info）和状态指示点。Processing 状态自带脉冲动画。

## 状态标签

```vue
<template>
  <div style="display: flex; gap: 8px; flex-wrap: wrap">
    <ProTag status="success">正常运行</ProTag>
    <ProTag status="warning">待审核</ProTag>
    <ProTag status="error">已停用</ProTag>
    <ProTag status="processing">同步中</ProTag>
    <ProTag status="info">草稿</ProTag>
    <ProTag status="default">未知</ProTag>
  </div>
</template>
```

## 自定义颜色

```vue
<template>
  <ProTag color="#f50">Hot</ProTag>
  <ProTag color="#2db7f5">Cool</ProTag>
  <ProTag color="#87d068">Success</ProTag>
</template>
```

## API

### Props

| 属性       | 类型                                                                       | 默认值 | 说明                      |
| ---------- | -------------------------------------------------------------------------- | ------ | ------------------------- |
| `status`   | `'success' \| 'warning' \| 'error' \| 'info' \| 'processing' \| 'default'` | —      | 预设状态类型              |
| `color`    | `string`                                                                   | —      | 自定义颜色（覆盖 status） |
| `bordered` | `boolean`                                                                  | `true` | 是否显示边框              |

其余 Props 同 [Element Plus Tag](https://element-plus.org/zh-CN/component/tag.html)。
