---
outline: deep
---

# ProTag 增强标签

基于 Element Plus `ElTag` 的增强封装，支持预设状态色板（success/warning/error/processing/info）和状态指示点。Processing 状态自带脉冲动画。

## 状态标签

<demo vue="../../packages/tag/demos/basic.vue" />

## 自定义颜色

<demo vue="../../packages/tag/demos/custom-color.vue" />

## API

### Props

| 属性       | 类型                                                                       | 默认值 | 说明                      |
| ---------- | -------------------------------------------------------------------------- | ------ | ------------------------- |
| `status`   | `'success' \| 'warning' \| 'error' \| 'info' \| 'processing' \| 'default'` | —      | 预设状态类型              |
| `color`    | `string`                                                                   | —      | 自定义颜色（覆盖 status） |
| `bordered` | `boolean`                                                                  | `true` | 是否显示边框              |

其余 Props 同 [Element Plus Tag](https://element-plus.org/zh-CN/component/tag.html)。
