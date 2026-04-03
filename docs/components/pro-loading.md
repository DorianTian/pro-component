---
outline: deep
---

# ProLoading 加载状态

声明式状态机组件，根据 `loading`、`empty`、`error` 三个 prop 自动切换对应的 UI 状态。优先级：loading > error > empty > success。

::: info Pro 深度增强
ProLoading 是一个状态机组件，统一管理异步数据的四种状态：

- **四态切换** — `loading` → `success` / `empty` / `error`，一个组件覆盖全部场景
- **骨架屏加载** — 加载状态自带动画骨架屏，可配行数
- **Error 重试** — 错误状态显示错误信息 + 重试按钮，触发 `@retry` 事件
- **自定义插槽** — `#loading` / `#empty` / `#error` 三个插槽支持完全自定义
- **真实场景** — 配合 async 请求使用，自动切换 loading → data/empty/error
  :::

## 基础用法

通过开关控制加载状态，加载完成后显示实际内容。

<demo vue="../../packages/loading/demos/basic.vue" />

## 四种状态切换

点击按钮切换 loading / empty / error / success 四种状态：

<demo vue="../../packages/loading/demos/states.vue" />

## 骨架屏行数

通过 `skeletonRows` 控制默认骨架屏的行数，适配不同内容高度。

<demo vue="../../packages/loading/demos/skeleton.vue" />

## 自定义插槽

通过 `#loading`、`#empty`、`#error` 插槽完全自定义各状态的展示内容。

<demo vue="../../packages/loading/demos/custom-slots.vue" />

## 错误重试

错误状态带有重试按钮，点击后触发 `@retry` 事件。

<demo vue="../../packages/loading/demos/retry.vue" />

## 真实场景

模拟异步请求场景：加载 → 随机返回数据 / 空数据 / 错误。

<demo vue="../../packages/loading/demos/real-world.vue" />

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
