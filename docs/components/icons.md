---
outline: deep
---

# Icons 图标库

基于 [Lucide Icons](https://lucide.dev) 的企业级图标库，按功能分类为 9 个模块，支持 tree-shaking 按需引入。点击图标可复制名称。

## 图标预览

<demo vue="../../packages/icons/demos/preview.vue" />

## 安装

```bash
pnpm add @pro/icons lucide-vue-next
```

## 使用方式

### 按分类引入（推荐，tree-shaking 友好）

```vue
<script setup>
import { Search, ChevronDown } from '@pro/icons/navigation'
import { Copy, Trash2 } from '@pro/icons/action'
import { Bold, Italic } from '@pro/icons/editor'
</script>

<template>
  <Search :size="20" />
  <Copy :size="16" color="#666" />
  <Bold :size="16" />
</template>
```

### 全量引入

```ts
import { Search, Bold, Copy, User, Database } from '@pro/icons'
```

## 分类模块

| 模块          | 导入路径                   | 说明                          |
| ------------- | -------------------------- | ----------------------------- |
| Navigation    | `@pro/icons/navigation`    | 导航、菜单、方向箭头、布局    |
| Action        | `@pro/icons/action`        | 增删改查、复制、撤销、拖拽    |
| Status        | `@pro/icons/status`        | 成功、失败、警告、加载、提示  |
| Data          | `@pro/icons/data`          | 图表、数据库、表格、趋势、Git |
| User          | `@pro/icons/user`          | 用户、权限、安全、密钥        |
| File          | `@pro/icons/file`          | 文件、文件夹、媒体、链接      |
| Communication | `@pro/icons/communication` | 邮件、消息、电话、发送        |
| Commerce      | `@pro/icons/commerce`      | 购物、支付、物流、企业        |
| Editor        | `@pro/icons/editor`        | 富文本格式、对齐、编辑器操作  |

## Props

所有图标继承 Lucide 通用 Props：

| 属性                | 类型               | 默认值         | 说明                   |
| ------------------- | ------------------ | -------------- | ---------------------- |
| size                | `number \| string` | `24`           | 图标尺寸（px）         |
| color               | `string`           | `currentColor` | 图标颜色               |
| strokeWidth         | `number \| string` | `2`            | 线条粗细               |
| absoluteStrokeWidth | `boolean`          | `false`        | 固定线宽不随 size 缩放 |
