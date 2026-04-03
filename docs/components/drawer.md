---
outline: deep
---

# Drawer 抽屉

基于 Element Plus `ElDrawer` 的统一封装，默认挂载到 body。

::: info Pro 增强
相比原生 `ElDrawer`，Pro Drawer 提供：
- **智能默认值** — `appendToBody` 默认开启，避免 z-index 层级问题
- **Design Token** — 自动集成 shadcn New York 视觉规范
:::

## 默认配置

| 属性           | 默认值 | 说明                          |
| -------------- | ------ | ----------------------------- |
| `appendToBody` | `true` | 默认挂载到 body，避免层级问题 |

## 基础用法

最简单的抽屉用法。

<demo vue="../../packages/drawer/demos/basic.vue" />

## 不同方向

通过 `direction` 属性控制抽屉从哪个方向滑出。

<demo vue="../../packages/drawer/demos/direction.vue" />

## 不同尺寸

通过 `size` 属性设置抽屉宽度或高度。

<demo vue="../../packages/drawer/demos/sizes.vue" />

## 嵌套抽屉

在抽屉内部打开另一个抽屉。

<demo vue="../../packages/drawer/demos/nested.vue" />

## 表单抽屉

在抽屉中嵌入表单，适用于侧边数据录入场景。

<demo vue="../../packages/drawer/demos/form.vue" />

## 自定义头部与底部

通过 `header` 和 `footer` 插槽自定义抽屉头部和底部内容。

<demo vue="../../packages/drawer/demos/custom-header.vue" />

## 无头部模式

设置 `withHeader` 为 `false` 隐藏头部区域。

<demo vue="../../packages/drawer/demos/no-header.vue" />

## API

### Props

| 属性                   | 类型                               | 默认值  | 说明                 |
| ---------------------- | ---------------------------------- | ------- | -------------------- |
| `modelValue / v-model` | `boolean`                          | `false` | 是否显示             |
| `title`                | `string`                           | —       | 标题                 |
| `direction`            | `'rtl' \| 'ltr' \| 'ttb' \| 'btt'` | `'rtl'` | 打开方向             |
| `size`                 | `string \| number`                 | `'30%'` | 宽度/高度            |
| `appendToBody`         | `boolean`                          | `true`  | 是否挂载到 body      |
| `modal`                | `boolean`                          | `true`  | 是否显示遮罩层       |
| `lockScroll`           | `boolean`                          | `true`  | 是否锁定滚动         |
| `closeOnClickModal`    | `boolean`                          | `true`  | 点击遮罩层是否关闭   |
| `closeOnPressEscape`   | `boolean`                          | `true`  | 按 ESC 是否关闭      |
| `showClose`            | `boolean`                          | `true`  | 是否显示关闭按钮     |
| `withHeader`           | `boolean`                          | `true`  | 是否显示头部         |
| `destroyOnClose`       | `boolean`                          | `false` | 关闭时是否销毁子元素 |

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
| `default` | 抽屉内容   |
| `header`  | 自定义头部 |
| `footer`  | 自定义底部 |

完整 Props/Events/Slots 同 [Element Plus Drawer](https://element-plus.org/zh-CN/component/drawer.html)，所有原生属性均可透传。
