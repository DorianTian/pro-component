---
outline: deep
---

# ProResult 结果页

增强型结果页组件，支持 7 种预设类型，HTTP 错误码（403/404/500）自带水印背景。

## 预设类型

```vue
<template>
  <ProResult type="success" />
</template>
```

## HTTP 错误码

HTTP 错误类型带有大字水印效果：

```vue
<template>
  <ProResult type="404">
    <template #extra>
      <el-button type="primary">返回首页</el-button>
    </template>
  </ProResult>
</template>
```

## 自定义内容

```vue
<template>
  <ProResult type="error" title="提交失败" sub-title="请检查网络连接后重试">
    <template #extra>
      <el-button type="primary">重试</el-button>
      <el-button>返回</el-button>
    </template>
  </ProResult>
</template>
```

## API

### Props

| 属性       | 类型                                                                     | 默认值      | 说明                     |
| ---------- | ------------------------------------------------------------------------ | ----------- | ------------------------ |
| `type`     | `'success' \| 'error' \| 'warning' \| 'info' \| '403' \| '404' \| '500'` | `'success'` | 结果类型                 |
| `title`    | `string`                                                                 | —           | 自定义标题（覆盖预设）   |
| `subTitle` | `string`                                                                 | —           | 自定义副标题（覆盖预设） |

### Slots

| 插槽        | 说明             |
| ----------- | ---------------- |
| `icon`      | 自定义图标       |
| `title`     | 自定义标题区域   |
| `sub-title` | 自定义副标题区域 |
| `extra`     | 操作按钮区域     |
