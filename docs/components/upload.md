---
outline: deep
---

# Upload 上传

基于 Element Plus `ElUpload` 的统一封装。统一 shadcn-vue 视觉风格，API 同 Element Plus。

::: info Pro 增强
- **Design Token** — 自动集成 shadcn New York 视觉规范
- **统一导入** — `import { Upload } from '@pro/upload'`，与 Pro 组件生态统一
:::

## 基础用法

最简单的文件上传，点击按钮选择文件。

<demo vue="../../packages/upload/demos/basic.vue" />

## 拖拽上传

传入 `drag` 属性开启拖拽上传模式，支持批量拖拽。

<demo vue="../../packages/upload/demos/drag.vue" />

## 头像上传

隐藏文件列表，上传图片后直接预览，配合 `beforeUpload` 做格式和大小校验。

<demo vue="../../packages/upload/demos/avatar.vue" />

## 照片墙

`list-type="picture-card"` 模式，以卡片形式展示已上传图片，支持预览。

<demo vue="../../packages/upload/demos/photo-wall.vue" />

## 文件列表

`list-type="text"` 模式，以列表形式展示已上传文件，支持预设文件。

<demo vue="../../packages/upload/demos/file-list.vue" />

## 数量限制

通过 `limit` 属性限制上传文件数量，超出时触发 `on-exceed` 回调。

<demo vue="../../packages/upload/demos/limit.vue" />

## 手动上传

设置 `auto-upload="false"` 后需手动调用 `submit()` 方法触发上传。

<demo vue="../../packages/upload/demos/manual.vue" />

## 文件类型限制

通过 `accept` 属性和 `beforeUpload` 钩子双重校验文件类型。

<demo vue="../../packages/upload/demos/accept.vue" />

## API

完整 Props/Events/Slots 同 [Element Plus Upload](https://element-plus.org/zh-CN/component/upload.html)，所有原生属性均可透传。
