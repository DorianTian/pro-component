---
outline: deep
---

# ProTree 增强树

基于 Element Plus `ElTree` 的增强封装，内置搜索过滤、展开收起、选中高亮、子节点计数徽标。采用 shadcn 风格设计，适用于数据域、组织架构、目录导航等树形场景。

## 基础用法

默认启用搜索框，支持节点 label 模糊匹配。

```vue
<script setup>
import { ref } from 'vue'

const treeData = [
  {
    id: 1,
    label: '数据域 A',
    children: [
      { id: 11, label: '业务过程 A-1' },
      { id: 12, label: '业务过程 A-2' },
      { id: 13, label: '业务过程 A-3' },
    ],
  },
  {
    id: 2,
    label: '数据域 B',
    children: [
      { id: 21, label: '业务过程 B-1' },
      { id: 22, label: '业务过程 B-2' },
    ],
  },
  {
    id: 3,
    label: '数据域 C',
    children: [],
  },
]
</script>

<template>
  <div style="width: 280px">
    <ProTree :data="treeData" default-expand-all highlight-current />
  </div>
</template>
```

## 关闭搜索

```vue
<template>
  <ProTree :data="treeData" :searchable="false" />
</template>
```

## 自定义过滤方法

```vue
<script setup>
function customFilter(keyword, data) {
  // 同时匹配 label 和 id
  return String(data.label).includes(keyword) || String(data.id).includes(keyword)
}
</script>

<template>
  <ProTree :data="treeData" :filter-method="customFilter" />
</template>
```

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

其余 Events 同 Element Plus Tree。

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
