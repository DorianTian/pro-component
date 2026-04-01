---
outline: deep
---

# ProLoading 加载状态

声明式状态机组件，根据 `loading`、`empty`、`error` 三个 prop 自动切换对应的 UI 状态。优先级：loading > error > empty > success。

## 基础用法

点击按钮切换不同状态：

<demo vue="../../packages/loading/demos/basic.vue" />

## API

### Props

| 属性               | 类型                      | 默认值                   | 说明             |
| ------------------ | ------------------------- | ------------------------ | ---------------- |
| `loading`          | `boolean`                 | `false`                  | 是否加载中       |
| `empty`            | `boolean`                 | `false`                  | 数据是否为空     |
| `error`            | `string \| Error \| null` | `null`                   | 错误信息         |
| `skeletonRows`     | `number`                  | `4`                      | 默认骨架屏行数   |
| `animated`         | `boolean`                 | `true`                   | 骨架屏是否带动画 |
| `emptyDescription` | `string`                  | `'No data'`              | 空状态描述       |
| `errorTitle`       | `string`                  | `'Something went wrong'` | 错误状态标题     |

### Events

| 事件    | 说明               |
| ------- | ------------------ |
| `retry` | 点击重试按钮时触发 |

### Slots

| 插槽      | 参数                                   | 说明               |
| --------- | -------------------------------------- | ------------------ |
| `default` | —                                      | 成功状态展示的内容 |
| `loading` | —                                      | 自定义加载状态     |
| `empty`   | —                                      | 自定义空状态       |
| `error`   | `{ error: string, retry: () => void }` | 自定义错误状态     |
