---
outline: deep
---

# ProTree 增强树

基于 Element Plus `ElTree` 的增强封装，内置搜索过滤、展开收起、选中高亮、子节点计数徽标。采用 shadcn 风格设计，适用于数据域、组织架构、目录导航等树形场景。

## 基础用法

默认启用搜索框，支持节点 label 模糊匹配，子节点自动显示计数徽标。

<demo vue="../../packages/tree/demos/basic.vue" />

## 搜索过滤

内置搜索框支持实时过滤，输入关键词自动筛选匹配节点。

<demo vue="../../packages/tree/demos/search.vue" />

## 多选模式

传入 `show-checkbox` 开启复选框，配合 `@check` 事件获取选中节点。

<demo vue="../../packages/tree/demos/check.vue" />

## 展开 / 收起

通过 `expandAll()` 和 `collapseAll()` 方法编程式控制节点展开状态。

<demo vue="../../packages/tree/demos/expand-all.vue" />

## 自定义节点

通过 `#default` 插槽自定义节点内容，例如添加状态标签。

<demo vue="../../packages/tree/demos/custom-node.vue" />

## 懒加载

配合 `lazy` 和 `:load` 属性实现子节点按需加载。

<demo vue="../../packages/tree/demos/lazy.vue" />

## 拖拽排序

传入 `draggable` 属性开启节点拖拽功能。

<demo vue="../../packages/tree/demos/draggable.vue" />

## 禁用节点

通过节点数据中的 `disabled` 字段控制节点禁用状态。

<demo vue="../../packages/tree/demos/disabled.vue" />

## API

### Props

| 属性                | 类型                                                  | 默认值        | 说明                 |
| ------------------- | ----------------------------------------------------- | ------------- | -------------------- |
| `data`              | `ProTreeNodeData[]`                                   | `[]`          | 树数据               |
| `searchable`        | `boolean`                                             | `true`        | 是否显示搜索框       |
| `searchPlaceholder` | `string`                                              | `'Search...'` | 搜索框占位文本       |
| `searchDebounceMs`  | `number`                                              | `300`         | 搜索防抖延迟（毫秒） |
| `defaultExpandAll`  | `boolean`                                             | `false`       | 是否默认展开所有节点 |
| `nodeKey`           | `string`                                              | `'id'`        | 节点唯一标识字段     |
| `filterMethod`      | `(keyword: string, data: ProTreeNodeData) => boolean` | —             | 自定义过滤方法       |

其余 Props 同 [Element Plus Tree](https://element-plus.org/zh-CN/component/tree.html)，通过 `$attrs` 透传。

### Events

| 事件     | 参数                | 说明                 |
| -------- | ------------------- | -------------------- |
| `search` | `(keyword: string)` | 搜索关键词变化时触发 |

### Slots

| 插槽            | 说明                                     |
| --------------- | ---------------------------------------- |
| `default`       | 自定义节点内容（同 ElTree default slot） |
| `toolbar-extra` | 工具栏右侧额外操作区                     |

### Expose

| 方法                        | 说明                 |
| --------------------------- | -------------------- |
| `getTreeRef()`              | 获取内部 ElTree 实例 |
| `expandAll()`               | 展开所有节点         |
| `collapseAll()`             | 收起所有节点         |
| `setSearchKeyword(keyword)` | 编程式设置搜索关键词 |
