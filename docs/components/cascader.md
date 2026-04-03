---
outline: deep
---

# Cascader 级联选择器

基于 Element Plus `ElCascader` 的统一封装，默认启用 `clearable` 和 `filterable`。

## 默认配置

| 属性         | 默认值 | 说明           |
| ------------ | ------ | -------------- |
| `clearable`  | `true` | 默认可清除     |
| `filterable` | `true` | 默认可搜索过滤 |

## 基础用法

基本的级联选择器用法。

<demo vue="../../packages/cascader/demos/basic.vue" />

## 禁用状态

通过 `disabled` 属性或选项的 `disabled` 字段设置禁用。

<demo vue="../../packages/cascader/demos/disabled.vue" />

## 不同尺寸

通过 `size` 属性控制尺寸，可选值为 `large`、`default`、`small`。

<demo vue="../../packages/cascader/demos/sizes.vue" />

## 多选

通过 `props.multiple` 属性启用多选模式。

<demo vue="../../packages/cascader/demos/multiple.vue" />

## 可搜索

设置 `filterable` 属性启用选项搜索过滤功能（默认已启用）。

<demo vue="../../packages/cascader/demos/search.vue" />

## 悬停展开

通过 `props.expandTrigger` 设置为 `'hover'`，鼠标悬停即可展开子级。

<demo vue="../../packages/cascader/demos/hover.vue" />

## 自定义节点

通过默认插槽自定义级联选项的渲染内容。

<demo vue="../../packages/cascader/demos/custom-node.vue" />

## 任意级别选择

设置 `props.checkStrictly` 允许选择任意一级选项，而非仅叶子节点。

<demo vue="../../packages/cascader/demos/any-level.vue" />

## 懒加载

设置 `props.lazy` 和 `props.lazyLoad` 实现按需异步加载子节点。

<demo vue="../../packages/cascader/demos/lazy.vue" />

## 面板模式

直接使用 `ElCascaderPanel` 组件实现无输入框的面板选择。

<demo vue="../../packages/cascader/demos/panel.vue" />

## API

### Props

| 属性名                  | 说明                       | 类型                                               | 默认值  |
| ----------------------- | -------------------------- | -------------------------------------------------- | ------- |
| `model-value / v-model` | 绑定值                     | `string \| number \| array`                        | —       |
| `options`               | 选项数据源                 | `CascaderOption[]`                                 | `[]`    |
| `props`                 | 配置选项                   | `CascaderProps`                                    | —       |
| `size`                  | 尺寸                       | `'large' \| 'default' \| 'small'`                  | —       |
| `placeholder`           | 占位文本                   | `string`                                           | —       |
| `disabled`              | 是否禁用                   | `boolean`                                          | `false` |
| `clearable`             | 是否可清空                 | `boolean`                                          | `true`  |
| `filterable`            | 是否可搜索                 | `boolean`                                          | `true`  |
| `filter-method`         | 自定义搜索方法             | `(node: CascaderNode, keyword: string) => boolean` | —       |
| `separator`             | 选项分隔符                 | `string`                                           | `' / '` |
| `show-all-levels`       | 输入框中是否显示完整路径   | `boolean`                                          | `true`  |
| `collapse-tags`         | 多选时是否折叠标签         | `boolean`                                          | `false` |
| `collapse-tags-tooltip` | 悬浮时是否显示所有已选标签 | `boolean`                                          | `false` |
| `tag-type`              | 标签类型                   | `'success' \| 'info' \| 'warning' \| 'danger'`     | —       |
| `max-collapse-tags`     | 折叠标签最大显示数         | `number`                                           | `1`     |

### CascaderProps

| 属性名          | 说明               | 类型                                                              | 默认值       |
| --------------- | ------------------ | ----------------------------------------------------------------- | ------------ |
| `expandTrigger` | 子级展开触发方式   | `'click' \| 'hover'`                                              | `'click'`    |
| `multiple`      | 是否多选           | `boolean`                                                         | `false`      |
| `checkStrictly` | 是否可选任意一级   | `boolean`                                                         | `false`      |
| `emitPath`      | 是否返回路径数组   | `boolean`                                                         | `true`       |
| `lazy`          | 是否动态加载子级   | `boolean`                                                         | `false`      |
| `lazyLoad`      | 加载动态数据的方法 | `(node: Node, resolve: (data: CascaderOption[]) => void) => void` | —            |
| `value`         | 指定值的键名       | `string`                                                          | `'value'`    |
| `label`         | 指定标签的键名     | `string`                                                          | `'label'`    |
| `children`      | 指定子级的键名     | `string`                                                          | `'children'` |

### Events

| 事件名           | 说明                   | 参数                    |
| ---------------- | ---------------------- | ----------------------- |
| `change`         | 选中值变化时触发       | `(value: any)`          |
| `expand-change`  | 展开节点变化时触发     | `(expandedKeys: any[])` |
| `blur`           | 失去焦点时触发         | `(event: FocusEvent)`   |
| `focus`          | 获取焦点时触发         | `(event: FocusEvent)`   |
| `visible-change` | 下拉框显示/隐藏时触发  | `(visible: boolean)`    |
| `remove-tag`     | 多选模式移除标签时触发 | `(tagValue: any)`       |

### Slots

| 插槽名    | 说明                                    |
| --------- | --------------------------------------- |
| `default` | 自定义选项内容，参数为 `{ node, data }` |
| `empty`   | 无数据时的内容                          |

完整属性参考 [Element Plus Cascader](https://element-plus.org/zh-CN/component/cascader.html)。
