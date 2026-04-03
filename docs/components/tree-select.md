---
outline: deep
---

# TreeSelect 树形选择器

基于 Element Plus `ElTreeSelect` 的统一封装，默认启用 `clearable` 和 `filterable`。

::: info Pro 增强
相比原生 `ElTreeSelect`，Pro TreeSelect 提供：
- **智能默认值** — `clearable` 和 `filterable` 默认开启
- **Design Token** — 自动集成 shadcn New York 视觉规范
- **ValueType 生态** — `valueType: 'treeSelect'` 在 ProTable / ProForm 中统一驱动渲染
:::

## 默认配置

| 属性         | 默认值 | 说明           |
| ------------ | ------ | -------------- |
| `clearable`  | `true` | 默认可清除     |
| `filterable` | `true` | 默认可搜索过滤 |

## 基础用法

基本的树形选择器用法。

<demo vue="../../packages/tree-select/demos/basic.vue" />

## 多选

设置 `multiple` 属性启用多选模式。

<demo vue="../../packages/tree-select/demos/multiple.vue" />

## 父子不关联

设置 `check-strictly` 使父子节点选中状态互不关联。

<demo vue="../../packages/tree-select/demos/check-strictly.vue" />

## 可搜索

设置 `filterable` 属性启用树节点搜索过滤功能（默认已启用）。

<demo vue="../../packages/tree-select/demos/filterable.vue" />

## 禁用选项

通过数据中的 `disabled` 字段禁用特定树节点。

<demo vue="../../packages/tree-select/demos/disabled.vue" />

## 默认展开

通过 `default-expanded-keys` 属性设置初始展开的节点。

<demo vue="../../packages/tree-select/demos/default-expanded.vue" />

## 自定义内容

通过插槽自定义树节点的渲染内容。

<demo vue="../../packages/tree-select/demos/custom.vue" />

## 复选框模式

设置 `show-checkbox` 属性以复选框形式展示多选。

<demo vue="../../packages/tree-select/demos/show-checkbox.vue" />

## API

### Props

| 属性名                  | 说明                         | 类型                                  | 默认值                                                           |
| ----------------------- | ---------------------------- | ------------------------------------- | ---------------------------------------------------------------- |
| `model-value / v-model` | 绑定值                       | `string \| number \| array \| object` | —                                                                |
| `data`                  | 树形数据                     | `TreeNodeData[]`                      | `[]`                                                             |
| `multiple`              | 是否多选                     | `boolean`                             | `false`                                                          |
| `disabled`              | 是否禁用                     | `boolean`                             | `false`                                                          |
| `size`                  | 尺寸                         | `'large' \| 'default' \| 'small'`     | —                                                                |
| `clearable`             | 是否可清空                   | `boolean`                             | `true`                                                           |
| `filterable`            | 是否可搜索                   | `boolean`                             | `true`                                                           |
| `placeholder`           | 占位文本                     | `string`                              | —                                                                |
| `check-strictly`        | 父子节点是否不关联           | `boolean`                             | `false`                                                          |
| `show-checkbox`         | 是否显示复选框               | `boolean`                             | `false`                                                          |
| `collapse-tags`         | 多选时是否折叠标签           | `boolean`                             | `false`                                                          |
| `collapse-tags-tooltip` | 悬浮时是否显示所有已选标签   | `boolean`                             | `false`                                                          |
| `max-collapse-tags`     | 折叠标签最大显示数           | `number`                              | `1`                                                              |
| `default-expanded-keys` | 默认展开的节点 key 数组      | `array`                               | —                                                                |
| `render-after-expand`   | 是否在首次展开时才渲染子节点 | `boolean`                             | `true`                                                           |
| `node-key`              | 节点唯一标识的键名           | `string`                              | `'value'`                                                        |
| `props`                 | 配置选项，同 Tree 的 props   | `object`                              | `{ children: 'children', label: 'label', disabled: 'disabled' }` |

### Events

| 事件名           | 说明                   | 参数                                                        |
| ---------------- | ---------------------- | ----------------------------------------------------------- |
| `change`         | 选中值变化时触发       | `(value: any)`                                              |
| `visible-change` | 下拉框显示/隐藏时触发  | `(visible: boolean)`                                        |
| `remove-tag`     | 多选模式移除标签时触发 | `(tagValue: any)`                                           |
| `clear`          | 点击清除时触发         | —                                                           |
| `blur`           | 失去焦点时触发         | `(event: FocusEvent)`                                       |
| `focus`          | 获取焦点时触发         | `(event: FocusEvent)`                                       |
| `node-click`     | 点击节点时触发         | `(data: TreeNodeData, node: TreeNode)`                      |
| `node-expand`    | 展开节点时触发         | `(data: TreeNodeData, node: TreeNode)`                      |
| `node-collapse`  | 收起节点时触发         | `(data: TreeNodeData, node: TreeNode)`                      |
| `check`          | 勾选复选框时触发       | `(data: TreeNodeData, info: { checkedNodes, checkedKeys })` |

### Slots

| 插槽名    | 说明                                    |
| --------- | --------------------------------------- |
| `default` | 自定义节点内容，参数为 `{ node, data }` |
| `prefix`  | 选择器前缀内容                          |
| `empty`   | 无数据时的内容                          |

完整属性参考 [Element Plus TreeSelect](https://element-plus.org/zh-CN/component/tree-select.html)。
