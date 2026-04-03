---
outline: deep
---

# Dialog 对话框

基于 Element Plus `ElDialog` 的统一封装，默认挂载到 body 并启用拖拽。

::: info Pro 增强
相比原生 `ElDialog`，Pro Dialog 提供：
- **智能默认值** — `appendToBody` 默认开启（避免 z-index 层级问题），`draggable` 默认开启
- **Design Token** — 自动集成 shadcn New York 视觉规范（圆角、阴影、间距）
:::

## 默认配置

| 属性           | 默认值 | 说明                          |
| -------------- | ------ | ----------------------------- |
| `appendToBody` | `true` | 默认挂载到 body，避免层级问题 |
| `draggable`    | `true` | 默认可拖拽                    |

## 基础用法

最简单的对话框用法。

<demo vue="../../packages/dialog/demos/basic.vue" />

## 不同宽度

通过 `width` 属性设置不同宽度的对话框。

<demo vue="../../packages/dialog/demos/sizes.vue" />

## 可拖拽

对话框默认启用拖拽，可拖动标题栏移动位置。

<demo vue="../../packages/dialog/demos/draggable.vue" />

## 嵌套对话框

在对话框内部打开另一个对话框。

<demo vue="../../packages/dialog/demos/nested.vue" />

## 表单对话框

在对话框中嵌入表单，适用于数据录入场景。

<demo vue="../../packages/dialog/demos/form.vue" />

## 自定义头部

通过 `header` 插槽自定义对话框头部内容。

<demo vue="../../packages/dialog/demos/custom-header.vue" />

## 全屏

设置 `fullscreen` 属性使对话框全屏显示。

<demo vue="../../packages/dialog/demos/fullscreen.vue" />

## 关闭时销毁

设置 `destroy-on-close` 在关闭时销毁对话框内的子元素。

<demo vue="../../packages/dialog/demos/destroy-on-close.vue" />

## 居中布局

设置 `center` 使对话框标题和底部居中显示，`align-center` 使对话框在屏幕垂直居中。

<demo vue="../../packages/dialog/demos/center.vue" />

## API

### Props

| 属性                   | 类型               | 默认值  | 说明                 |
| ---------------------- | ------------------ | ------- | -------------------- |
| `modelValue / v-model` | `boolean`          | `false` | 是否显示             |
| `title`                | `string`           | —       | 标题                 |
| `width`                | `string \| number` | `'50%'` | 宽度                 |
| `fullscreen`           | `boolean`          | `false` | 是否全屏             |
| `modal`                | `boolean`          | `true`  | 是否显示遮罩层       |
| `appendToBody`         | `boolean`          | `true`  | 是否挂载到 body      |
| `lockScroll`           | `boolean`          | `true`  | 是否锁定滚动         |
| `closeOnClickModal`    | `boolean`          | `true`  | 点击遮罩层是否关闭   |
| `closeOnPressEscape`   | `boolean`          | `true`  | 按 ESC 是否关闭      |
| `showClose`            | `boolean`          | `true`  | 是否显示关闭按钮     |
| `draggable`            | `boolean`          | `true`  | 是否可拖拽           |
| `center`               | `boolean`          | `false` | 标题和底部是否居中   |
| `alignCenter`          | `boolean`          | `false` | 是否垂直居中         |
| `destroyOnClose`       | `boolean`          | `false` | 关闭时是否销毁子元素 |

### Events

| 事件                | 参数               | 说明               |
| ------------------- | ------------------ | ------------------ |
| `update:modelValue` | `(value: boolean)` | 显示状态改变时触发 |
| `open`              | —                  | 打开时触发         |
| `opened`            | —                  | 打开动画结束时触发 |
| `close`             | —                  | 关闭时触发         |
| `closed`            | —                  | 关闭动画结束时触发 |

### Slots

| 插槽      | 说明       |
| --------- | ---------- |
| `default` | 对话框内容 |
| `header`  | 自定义头部 |
| `footer`  | 自定义底部 |

完整 Props/Events/Slots 同 [Element Plus Dialog](https://element-plus.org/zh-CN/component/dialog.html)，所有原生属性均可透传。
