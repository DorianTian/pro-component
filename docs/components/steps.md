---
outline: deep
---

# Steps 步骤条

基于 Element Plus `ElSteps` / `ElStep` 的统一封装。统一 shadcn-vue 视觉风格，API 同 Element Plus。

::: info Pro 增强
- **Design Token** — 自动集成 shadcn New York 视觉规范（步骤条配色、字重）
- **统一导出** — 同时导出 `Steps` 和 `Step` 组件
:::

## 导出组件

- `Steps` -- 步骤条容器
- `Step` -- 单个步骤

## 基础用法

最简单的步骤条用法。

<demo vue="../../packages/steps/demos/basic.vue" />

## 垂直步骤条

设置 `direction="vertical"` 显示垂直步骤条。

<demo vue="../../packages/steps/demos/vertical.vue" />

## 简洁风格

设置 `simple` 属性使用简洁风格的步骤条。

<demo vue="../../packages/steps/demos/simple.vue" />

## 自定义图标

通过 `icon` 属性为步骤设置自定义图标。

<demo vue="../../packages/steps/demos/icon.vue" />

## 步骤状态

通过 `status` 属性设置每个步骤的状态（wait / process / finish / error / success）。

<demo vue="../../packages/steps/demos/status.vue" />

## 可点击步骤

结合事件处理实现可点击切换的步骤条。

<demo vue="../../packages/steps/demos/clickable.vue" />

## 带描述信息

通过 `description` 为每个步骤添加详细描述。

<demo vue="../../packages/steps/demos/description.vue" />

## 居中步骤条

设置 `align-center` 使步骤条标题和描述居中显示。

<demo vue="../../packages/steps/demos/center.vue" />

## API

### Steps Props

| 属性            | 类型                                                      | 默认值         | 说明           |
| --------------- | --------------------------------------------------------- | -------------- | -------------- |
| `active`        | `number`                                                  | `0`            | 当前激活步骤   |
| `direction`     | `'horizontal' \| 'vertical'`                              | `'horizontal'` | 方向           |
| `processStatus` | `'wait' \| 'process' \| 'finish' \| 'error' \| 'success'` | `'process'`    | 当前步骤状态   |
| `finishStatus`  | `'wait' \| 'process' \| 'finish' \| 'error' \| 'success'` | `'finish'`     | 结束步骤状态   |
| `alignCenter`   | `boolean`                                                 | `false`        | 是否居中对齐   |
| `simple`        | `boolean`                                                 | `false`        | 是否为简洁风格 |

### Step Props

| 属性          | 类型                                                      | 默认值 | 说明       |
| ------------- | --------------------------------------------------------- | ------ | ---------- |
| `title`       | `string`                                                  | —      | 标题       |
| `description` | `string`                                                  | —      | 描述文字   |
| `icon`        | `string \| Component`                                     | —      | 自定义图标 |
| `status`      | `'wait' \| 'process' \| 'finish' \| 'error' \| 'success'` | —      | 步骤状态   |

### Step Slots

| 插槽          | 说明       |
| ------------- | ---------- |
| `icon`        | 自定义图标 |
| `title`       | 自定义标题 |
| `description` | 自定义描述 |

完整 Props/Events/Slots 同 [Element Plus Steps](https://element-plus.org/zh-CN/component/steps.html)，所有原生属性均可透传。
