---
outline: deep
---

# ProTabs 增强标签页

基于 Element Plus `ElTabs` 的增强封装，支持关闭确认弹窗和 card 变体。

## 基础用法

<demo vue="../../packages/tabs/demos/basic.vue" />

## Card 变体

<demo vue="../../packages/tabs/demos/card.vue" />

## 可关闭 + 确认弹窗

关闭标签页前弹出确认对话框，防止误操作。

<demo vue="../../packages/tabs/demos/closable.vue" />

## API

### Props

| 属性             | 类型                                | 默认值              | 说明                      |
| ---------------- | ----------------------------------- | ------------------- | ------------------------- |
| `modelValue`     | `string`                            | —                   | 当前激活标签页（v-model） |
| `variant`        | `'line' \| 'card' \| 'border-card'` | `'line'`            | 标签页风格                |
| `closable`       | `boolean`                           | `false`             | 是否可关闭                |
| `confirmClose`   | `boolean`                           | `false`             | 关闭前是否弹出确认框      |
| `confirmMessage` | `string`                            | `'Are you sure...'` | 确认弹窗文案              |
| `confirmTitle`   | `string`                            | `'Confirm'`         | 确认弹窗标题              |

其余 Props 同 [Element Plus Tabs](https://element-plus.org/zh-CN/component/tabs.html)。

### Events

| 事件                | 参数              | 说明                     |
| ------------------- | ----------------- | ------------------------ |
| `update:modelValue` | `(value: string)` | 切换标签页               |
| `tab-remove`        | `(name: string)`  | 关闭标签页（确认后触发） |
| `tab-click`         | `(pane, event)`   | 点击标签页               |
