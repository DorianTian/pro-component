---
outline: deep
---

# Popconfirm 气泡确认框

基于 Element Plus `ElPopconfirm` 的统一封装。统一 shadcn-vue 视觉风格，API 同 Element Plus。

::: info Pro 增强

- **Design Token** — 自动集成 shadcn New York 视觉规范
- **统一导入** — `import { Popconfirm } from '@pro/popconfirm'`，与 Pro 组件生态统一
  :::

## 基础用法

最简单的气泡确认框用法。

<demo vue="../../packages/popconfirm/demos/basic.vue" />

## 自定义图标

通过 `icon` 和 `icon-color` 属性自定义确认框图标。

<demo vue="../../packages/popconfirm/demos/icon.vue" />

## 弹出位置

通过 `placement` 属性控制气泡确认框的弹出方向。

<demo vue="../../packages/popconfirm/demos/placement.vue" />

## 自定义按钮

通过属性自定义确认和取消按钮的文字和样式。

<demo vue="../../packages/popconfirm/demos/custom-buttons.vue" />

## 异步确认

结合异步操作，在确认回调中执行异步任务。

<demo vue="../../packages/popconfirm/demos/async.vue" />

## API

### Props

| 属性                | 类型                                                        | 默认值           | 说明            |
| ------------------- | ----------------------------------------------------------- | ---------------- | --------------- |
| `title`             | `string`                                                    | —                | 确认框标题/内容 |
| `confirmButtonText` | `string`                                                    | `'Yes'`          | 确认按钮文字    |
| `cancelButtonText`  | `string`                                                    | `'No'`           | 取消按钮文字    |
| `confirmButtonType` | `'primary' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `'primary'`      | 确认按钮类型    |
| `cancelButtonType`  | `'primary' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `'text'`         | 取消按钮类型    |
| `icon`              | `string \| Component`                                       | `QuestionFilled` | 图标            |
| `iconColor`         | `string`                                                    | `'#f90'`         | 图标颜色        |
| `hideIcon`          | `boolean`                                                   | `false`          | 是否隐藏图标    |
| `hideAfter`         | `number`                                                    | `200`            | 消失延迟（ms）  |
| `width`             | `string \| number`                                          | `150`            | 弹出框宽度      |
| `placement`         | `string`                                                    | `'top'`          | 弹出位置        |

### Events

| 事件      | 参数 | 说明           |
| --------- | ---- | -------------- |
| `confirm` | —    | 点击确认时触发 |
| `cancel`  | —    | 点击取消时触发 |

### Slots

| 插槽        | 说明                   |
| ----------- | ---------------------- |
| `default`   | 触发 Popconfirm 的元素 |
| `reference` | 同 default（触发元素） |

完整 Props/Events/Slots 同 [Element Plus Popconfirm](https://element-plus.org/zh-CN/component/popconfirm.html)，所有原生属性均可透传。
