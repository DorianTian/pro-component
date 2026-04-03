---
outline: deep
---

# Popover 弹出框

基于 Element Plus `ElPopover` 的统一封装。统一 shadcn-vue 视觉风格，API 同 Element Plus。

## 基础用法

<demo vue="../../packages/popover/demos/basic.vue" />

## 弹出方向

通过 `placement` 设置弹出方向。

<demo vue="../../packages/popover/demos/placement.vue" />

## 触发方式

支持 hover、click、focus、contextmenu。

<demo vue="../../packages/popover/demos/trigger.vue" />

## 嵌套操作

适合轻量级的二次确认场景。

<demo vue="../../packages/popover/demos/nested.vue" />

## 自定义宽度和内容

设置 `width` 和自定义丰富内容。

<demo vue="../../packages/popover/demos/width.vue" />

## 虚拟触发

通过 `virtual-ref` 绑定到任意元素。

<demo vue="../../packages/popover/demos/virtual-trigger.vue" />

## API

### Props

| 属性                 | 类型                                             | 默认值     | 说明             |
| -------------------- | ------------------------------------------------ | ---------- | ---------------- |
| `trigger`            | `'hover' \| 'click' \| 'focus' \| 'contextmenu'` | `'click'`  | 触发方式         |
| `title`              | `string`                                         | —          | 标题             |
| `content`            | `string`                                         | —          | 显示内容         |
| `width`              | `string \| number`                               | `150`      | 宽度             |
| `placement`          | `Placement`                                      | `'bottom'` | 弹出方向         |
| `visible / v-model`  | `boolean`                                        | —          | 手动控制显隐     |
| `virtual-ref`        | `HTMLElement`                                    | —          | 虚拟触发元素     |
| `virtual-triggering` | `boolean`                                        | `false`    | 是否使用虚拟触发 |

### Slots

| 名称        | 说明       |
| ----------- | ---------- |
| `default`   | 弹出框内容 |
| `reference` | 触发元素   |

完整 Props/Events/Slots 同 [Element Plus Popover](https://element-plus.org/zh-CN/component/popover.html)，所有原生属性均可透传。
