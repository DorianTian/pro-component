---
outline: deep
---

# ProResult 结果页

增强型结果页组件，支持 7 种预设类型，HTTP 错误码（403/404/500）自带水印背景。

::: info Pro 深度增强
ProResult 提供开箱即用的结果页解决方案：
- **7 种预设类型** — 基础 4 种（`success` / `error` / `warning` / `info`）+ HTTP 错误 3 种（`403` / `404` / `500`）
- **HTTP 错误水印** — `403` / `404` / `500` 类型显示大号水印错误码背景，视觉冲击力强
- **自动映射** — 每种类型自带默认标题和图标，传入 `type` 即可使用
- **完全可定制** — `#icon` / `#title` / `#sub-title` / `#extra` 四个插槽支持自定义
:::

## 成功结果

默认 `type="success"`，自带预设标题和副标题。

<demo vue="../../packages/result/demos/basic.vue" />

## 所有基础类型

4 种基础类型：success、error、warning、info，每种有不同的图标和配色。

<demo vue="../../packages/result/demos/all-types.vue" />

## 自定义图标

通过 `#icon` 插槽替换默认图标，实现个性化展示。

<demo vue="../../packages/result/demos/custom-icon.vue" />

## 操作按钮

通过 `#extra` 插槽添加操作按钮，支持多个按钮组合。

<demo vue="../../packages/result/demos/extra.vue" />

## HTTP 错误码

单个 HTTP 错误类型带有大字水印效果：

<demo vue="../../packages/result/demos/http-error.vue" />

## 所有 HTTP 错误

403、404、500 三种 HTTP 错误码对比展示：

<demo vue="../../packages/result/demos/http-errors.vue" />

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
