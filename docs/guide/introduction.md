# 介绍

Pro Components 是基于 [Vue 3](https://vuejs.org/) + [Element Plus](https://element-plus.org/) 构建的高级组件库，提供开箱即用的中后台场景组件。

## 设计理念

### Schema 驱动

通过统一的 `columns` 定义同时驱动 **表格列**、**搜索表单** 和 **详情展示** 三种场景，一份 Schema 多处复用：

```typescript
const columns: ProColumnDef[] = [
  {
    dataIndex: 'name',
    title: '姓名',
    valueType: 'text',
  },
  {
    dataIndex: 'status',
    title: '状态',
    valueType: 'select',
    valueEnum: {
      active: { text: '启用', status: 'success' },
      disabled: { text: '禁用', status: 'danger' },
    },
  },
  {
    dataIndex: 'createdAt',
    title: '创建时间',
    valueType: 'dateTime',
    hideInSearch: true,
  },
]
```

### Headless-First 架构

每个 Pro Component 都拆分为两部分：

- **Composable**（如 `useProTable`）— 管理所有状态和逻辑
- **Component**（如 `<ProTable />`）— 基于 composable 状态渲染 UI

支持两种使用模式：

| 模式                | 适用场景         | 示例                                                  |
| ------------------- | ---------------- | ----------------------------------------------------- |
| **简单模式**        | 大多数 CRUD 场景 | `<ProTable :columns="cols" :request="fn" />`          |
| **Composable 模式** | 需要外部控制状态 | `const { proTableProps, reload } = useProTable(opts)` |

### ValueType 体系

内置 15+ ValueType，自动决定表格渲染方式和搜索控件类型：

| ValueType   | 表格渲染      | 搜索控件               |
| ----------- | ------------- | ---------------------- |
| `text`      | 纯文本        | `el-input`             |
| `number`    | 格式化数字    | `el-input-number`      |
| `select`    | Tag 展示      | `el-select`            |
| `date`      | 格式化日期    | `el-date-picker`       |
| `dateRange` | —             | `el-date-picker` range |
| `money`     | 货币格式      | `el-input-number`      |
| `percent`   | 百分比        | `el-input-number`      |
| `progress`  | `el-progress` | —                      |
| `image`     | `el-image`    | —                      |

## 包结构

| 包名                  | 说明                                             |
| --------------------- | ------------------------------------------------ |
| `@pro/table`          | ProTable 高级表格                                |
| `@pro/form`           | ProForm 高级表单                                 |
| `@pro/descriptions`   | ProDescriptions 定义列表                         |
| `@pro/hooks`          | 共享 composables（useRequest、usePagination 等） |
| `@pro/utils`          | 工具函数和类型定义                               |
| `@pro/themes`         | 主题 token 和 CSS 变量                           |
| `@pro/resolvers`      | unplugin 自动导入解析器                          |
| `@pro/pro-components` | 聚合包，一次导入所有组件                         |

## 兼容性

- Vue >= 3.4.0
- Element Plus >= 2.9.0
- 现代浏览器（Chrome、Firefox、Safari、Edge 最新两个版本）
