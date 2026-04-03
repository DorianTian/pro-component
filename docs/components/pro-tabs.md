---
outline: deep
---

# ProTabs 增强标签页

基于 Element Plus `ElTabs` 的增强封装，支持关闭确认弹窗和 card 变体。

::: info Pro 深度增强
ProTabs 在 ElTabs 基础上增加了关键的业务体验优化：

- **关闭确认** — `confirmClose` 启用关闭前确认弹窗，防止误关重要标签页
- **语义化变体** — `variant` 属性支持 `'line'` / `'card'` / `'border-card'` 三种风格
- **自定义确认文案** — 支持配置确认弹窗标题和内容
- **ProTabPane** — 配套的标签面板组件，统一使用体验
  :::

## 基础用法

最简单的标签页用法。

<demo vue="../../packages/tabs/demos/basic.vue" />

## 卡片风格

设置 `variant="card"` 使用卡片风格标签页。

<demo vue="../../packages/tabs/demos/card.vue" />

## 可关闭标签

设置 `closable` 允许关闭标签页。

<demo vue="../../packages/tabs/demos/closable.vue" />

## 边框卡片

设置 `variant="border-card"` 使用带边框的卡片风格。

<demo vue="../../packages/tabs/demos/border-card.vue" />

## 标签位置

通过 `tab-position` 属性设置标签位置（top / right / bottom / left）。

<demo vue="../../packages/tabs/demos/position.vue" />

## 动态标签页

动态增减标签页，结合 `closable` 和自定义操作。

<demo vue="../../packages/tabs/demos/dynamic.vue" />

## 自定义标签

通过插槽自定义标签页头部内容。

<demo vue="../../packages/tabs/demos/custom-tab.vue" />

## 关闭确认

设置 `confirmClose` 在关闭标签页前弹出确认对话框，防止误操作。

<demo vue="../../packages/tabs/demos/confirm-close.vue" />

## 自适应宽度

设置 `stretch` 使标签宽度自适应容器。

<demo vue="../../packages/tabs/demos/stretch.vue" />

## API

### Props

| 属性             | 类型                                     | 默认值              | 说明                      |
| ---------------- | ---------------------------------------- | ------------------- | ------------------------- |
| `modelValue`     | `string`                                 | —                   | 当前激活标签页（v-model） |
| `variant`        | `'line' \| 'card' \| 'border-card'`      | `'line'`            | 标签页风格                |
| `closable`       | `boolean`                                | `false`             | 是否可关闭                |
| `confirmClose`   | `boolean`                                | `false`             | 关闭前是否弹出确认框      |
| `confirmMessage` | `string`                                 | `'Are you sure...'` | 确认弹窗文案              |
| `confirmTitle`   | `string`                                 | `'Confirm'`         | 确认弹窗标题              |
| `tabPosition`    | `'top' \| 'right' \| 'bottom' \| 'left'` | `'top'`             | 标签位置                  |
| `stretch`        | `boolean`                                | `false`             | 标签宽度是否自适应        |

其余 Props 同 [Element Plus Tabs](https://element-plus.org/zh-CN/component/tabs.html)。

### Events

| 事件                | 参数              | 说明                     |
| ------------------- | ----------------- | ------------------------ |
| `update:modelValue` | `(value: string)` | 切换标签页               |
| `tab-remove`        | `(name: string)`  | 关闭标签页（确认后触发） |
| `tab-click`         | `(pane, event)`   | 点击标签页               |
| `tab-change`        | `(name: string)`  | 标签页切换时触发         |

### Slots

| 插槽                      | 说明                    |
| ------------------------- | ----------------------- |
| `default`                 | 标签页内容（ElTabPane） |
| `label`（ElTabPane 插槽） | 自定义标签头部          |
