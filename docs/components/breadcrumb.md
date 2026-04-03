---
outline: deep
---

# Breadcrumb 面包屑

基于 Element Plus `ElBreadcrumb` / `ElBreadcrumbItem` 的统一封装，预置分隔符。

::: info Pro 增强
相比原生 `ElBreadcrumb`，Pro Breadcrumb 提供：

- **智能默认值** — `separator` 默认 `'/'`
- **Design Token** — 自动集成 shadcn New York 视觉规范
  :::

## 导出组件

- `Breadcrumb` — 面包屑容器
- `BreadcrumbItem` — 面包屑项

## 默认配置

| 属性        | 默认值 | 说明       |
| ----------- | ------ | ---------- |
| `separator` | `'/'`  | 默认分隔符 |

## 基础用法

<demo vue="../../packages/breadcrumb/demos/basic.vue" />

## 自定义分隔符

通过 `separator` 属性设置不同分隔符。

<demo vue="../../packages/breadcrumb/demos/separator.vue" />

## 带图标

在面包屑项中添加图标。

<demo vue="../../packages/breadcrumb/demos/icon.vue" />

## API

### Breadcrumb Props

| 属性             | 类型        | 默认值 | 说明       |
| ---------------- | ----------- | ------ | ---------- |
| `separator`      | `string`    | `'/'`  | 分隔符     |
| `separator-icon` | `Component` | —      | 图标分隔符 |

### BreadcrumbItem Props

| 属性      | 类型               | 默认值  | 说明                        |
| --------- | ------------------ | ------- | --------------------------- |
| `to`      | `string \| object` | —       | 路由跳转目标，同 vue-router |
| `replace` | `boolean`          | `false` | 是否使用 replace 而非 push  |

### Slots

| 组件             | 名称      | 说明                |
| ---------------- | --------- | ------------------- |
| `Breadcrumb`     | `default` | BreadcrumbItem 列表 |
| `BreadcrumbItem` | `default` | 面包屑项内容        |

完整 Props/Events/Slots 同 [Element Plus Breadcrumb](https://element-plus.org/zh-CN/component/breadcrumb.html)，所有原生属性均可透传。
