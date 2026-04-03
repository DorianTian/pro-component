---
outline: deep
---

# AutoComplete 自动补全

基于 Element Plus `ElAutocomplete` 的统一封装。统一 shadcn-vue 视觉风格，API 同 Element Plus。

::: info Pro 增强
- **Design Token** — 自动集成 shadcn New York 视觉规范（focus ring、border、圆角）
- **统一导入** — `import { AutoComplete } from '@pro/auto-complete'`，与 Pro 组件生态统一
:::

## 基础用法

基本的自动补全输入框用法。

<demo vue="../../packages/auto-complete/demos/basic.vue" />

## 可清除

通过 `clearable` 属性启用清除按钮。

<demo vue="../../packages/auto-complete/demos/clearable.vue" />

## 自定义模板

通过默认插槽自定义建议项的渲染模板。

<demo vue="../../packages/auto-complete/demos/custom-template.vue" />

## 远程搜索

配合异步请求实现远程数据搜索与建议。

<demo vue="../../packages/auto-complete/demos/remote.vue" />

## 弹出位置

通过 `placement` 属性控制建议列表的弹出方向。

<demo vue="../../packages/auto-complete/demos/placement.vue" />

## 高亮首项

通过 `highlight-first-item` 属性自动高亮建议列表中的第一项。

<demo vue="../../packages/auto-complete/demos/highlight.vue" />

## API

### Props

| 属性名                  | 说明                               | 类型                                                                              | 默认值           |
| ----------------------- | ---------------------------------- | --------------------------------------------------------------------------------- | ---------------- |
| `model-value / v-model` | 绑定值                             | `string`                                                                          | —                |
| `fetch-suggestions`     | 获取建议数据的方法                 | `(queryString: string, cb: (data: any[]) => void) => void`                        | —                |
| `placeholder`           | 占位文本                           | `string`                                                                          | —                |
| `clearable`             | 是否可清空                         | `boolean`                                                                         | `false`          |
| `disabled`              | 是否禁用                           | `boolean`                                                                         | `false`          |
| `value-key`             | 建议项对象中用于显示的键名         | `string`                                                                          | `'value'`        |
| `debounce`              | 输入防抖延迟（毫秒）               | `number`                                                                          | `300`            |
| `placement`             | 弹出位置                           | `'top' \| 'top-start' \| 'top-end' \| 'bottom' \| 'bottom-start' \| 'bottom-end'` | `'bottom-start'` |
| `trigger-on-focus`      | 聚焦时是否显示建议                 | `boolean`                                                                         | `true`           |
| `select-when-unmatched` | 无匹配时按回车是否触发 select 事件 | `boolean`                                                                         | `false`          |
| `highlight-first-item`  | 是否高亮第一项                     | `boolean`                                                                         | `false`          |
| `fit-input-width`       | 建议列表是否与输入框等宽           | `boolean`                                                                         | `false`          |

### Events

| 事件名   | 说明             | 参数              |
| -------- | ---------------- | ----------------- |
| `select` | 选择建议项时触发 | `(item: object)`  |
| `change` | 值改变时触发     | `(value: string)` |

### Slots

| 插槽名    | 说明                                |
| --------- | ----------------------------------- |
| `default` | 自定义建议项内容，参数为 `{ item }` |
| `prefix`  | 输入框头部内容                      |
| `suffix`  | 输入框尾部内容                      |
| `prepend` | 输入框前置内容                      |
| `append`  | 输入框后置内容                      |

完整属性参考 [Element Plus Autocomplete](https://element-plus.org/zh-CN/component/autocomplete.html)。
