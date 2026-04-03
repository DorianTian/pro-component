---
outline: deep
---

# Pagination 分页

基于 Element Plus `ElPagination` 的统一封装，预置完整分页布局和常用页码选项。

::: info Pro 增强
相比原生 `ElPagination`，Pro Pagination 提供：
- **智能默认值** — `layout` 默认包含完整功能（total + sizes + prev/pager/next + jumper），`pageSizes` 默认 `[10, 20, 50, 100]`
- **Design Token** — 自动集成 shadcn New York 视觉规范（按钮对齐、字重）
:::

## 默认配置

| 属性        | 默认值                                      | 说明             |
| ----------- | ------------------------------------------- | ---------------- |
| `layout`    | `'total, sizes, prev, pager, next, jumper'` | 完整分页布局     |
| `pageSizes` | `[10, 20, 50, 100]`                         | 常用每页条数选项 |

## 基础用法

最简单的分页组件用法。

<demo vue="../../packages/pagination/demos/basic.vue" />

## 带背景色

设置 `background` 为页码按钮添加背景色。

<demo vue="../../packages/pagination/demos/background.vue" />

## 每页条数

通过 `sizes` 布局项和 `page-sizes` 属性配置每页条数选择器。

<demo vue="../../packages/pagination/demos/sizes.vue" />

## 小型分页

设置 `small` 使用小型分页样式。

<demo vue="../../packages/pagination/demos/small.vue" />

## 禁用状态

通过 `disabled` 属性禁用分页组件。

<demo vue="../../packages/pagination/demos/disabled.vue" />

## 单页隐藏

设置 `hide-on-single-page` 只有一页时自动隐藏分页。

<demo vue="../../packages/pagination/demos/hide-single.vue" />

## 自定义布局

通过 `layout` 属性自定义分页组件的布局排列。

<demo vue="../../packages/pagination/demos/custom-layout.vue" />

## 页码按钮数

通过 `pager-count` 属性设置最大页码按钮数。

<demo vue="../../packages/pagination/demos/pager-count.vue" />

## API

### Props

| 属性                                 | 类型       | 默认值                                      | 说明                   |
| ------------------------------------ | ---------- | ------------------------------------------- | ---------------------- |
| `total`                              | `number`   | —                                           | 总条目数               |
| `currentPage / v-model:current-page` | `number`   | `1`                                         | 当前页码               |
| `pageSize / v-model:page-size`       | `number`   | `10`                                        | 每页条数               |
| `pageSizes`                          | `number[]` | `[10, 20, 50, 100]`                         | 每页条数选项           |
| `pagerCount`                         | `number`   | `7`                                         | 最大页码按钮数（奇数） |
| `layout`                             | `string`   | `'total, sizes, prev, pager, next, jumper'` | 布局                   |
| `background`                         | `boolean`  | `false`                                     | 是否添加背景色         |
| `small`                              | `boolean`  | `false`                                     | 是否使用小型分页       |
| `disabled`                           | `boolean`  | `false`                                     | 是否禁用               |
| `hideOnSinglePage`                   | `boolean`  | `false`                                     | 只有一页时是否隐藏     |

### Events

| 事件                  | 参数             | 说明               |
| --------------------- | ---------------- | ------------------ |
| `update:current-page` | `(page: number)` | 页码改变时触发     |
| `update:page-size`    | `(size: number)` | 每页条数改变时触发 |
| `current-change`      | `(page: number)` | 页码改变时触发     |
| `size-change`         | `(size: number)` | 每页条数改变时触发 |
| `prev-click`          | `(page: number)` | 点击上一页时触发   |
| `next-click`          | `(page: number)` | 点击下一页时触发   |

### Slots

| 插槽      | 说明                              |
| --------- | --------------------------------- |
| `default` | 自定义内容（layout 中的 slot 项） |

完整 Props/Events/Slots 同 [Element Plus Pagination](https://element-plus.org/zh-CN/component/pagination.html)，所有原生属性均可透传。
