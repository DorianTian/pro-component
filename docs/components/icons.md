---
outline: deep
---

# Icons 图标库

基于 [Lucide Icons](https://lucide.dev) 的企业级图标库，按功能分类为 9 个模块，支持 tree-shaking 按需引入。

## 安装

```bash
pnpm add @pro/icons lucide-vue-next
```

## 按分类引入（推荐）

```vue
<script setup>
import { Search, ChevronDown } from '@pro/icons/navigation'
import { Copy, Trash2, Undo2 } from '@pro/icons/action'
import { Bold, Italic, Heading1 } from '@pro/icons/editor'
</script>

<template>
  <Search :size="20" />
  <Copy :size="16" color="#666" />
  <Bold :size="16" />
</template>
```

## 全量引入

```ts
import { Search, Bold, Copy, User, Database } from '@pro/icons'
```

## 图标分类

### Navigation 导航核心

| 图标 | 名称 | 用途 |
|------|------|------|
| `Home` | Home | 首页 |
| `Menu` | Menu | 菜单 |
| `Search` | Search | 搜索 |
| `Settings` | Settings | 设置 |
| `Bell` | Bell | 通知 |
| `ChevronDown/Right/Left/Up` | Chevron* | 方向箭头 |
| `ArrowDown/Right/Left/Up` | Arrow* | 导航箭头 |
| `ExternalLink` | ExternalLink | 外部链接 |
| `Command` | Command | 命令 |
| `LayoutDashboard` | LayoutDashboard | 仪表盘 |
| `Maximize` / `Minimize` | Max/Minimize | 全屏 |

### Action 操作动作

| 图标 | 名称 | 用途 |
|------|------|------|
| `Plus` / `Minus` | Plus/Minus | 增删 |
| `Pencil` / `PenLine` | Pencil | 编辑 |
| `Trash2` | Trash2 | 删除 |
| `Save` | Save | 保存 |
| `Copy` / `ClipboardCopy` | Copy | 复制 |
| `Download` / `Upload` | Down/Upload | 上传下载 |
| `RefreshCw` / `RefreshCcw` | Refresh* | 刷新 |
| `Filter` / `SlidersHorizontal` | Filter | 筛选 |
| `Undo2` / `Redo2` | Undo/Redo | 撤销重做 |
| `GripVertical` / `GripHorizontal` | Grip* | 拖拽手柄 |
| `Move` | Move | 移动 |

### Status 状态反馈

| 图标 | 名称 | 用途 |
|------|------|------|
| `Check` / `CheckCircle2` | Check* | 成功 |
| `X` / `XCircle` | X* | 失败/关闭 |
| `AlertTriangle` / `AlertCircle` | Alert* | 警告 |
| `Info` | Info | 信息 |
| `HelpCircle` | HelpCircle | 帮助 |
| `Loader2` | Loader2 | 加载中 |
| `Star` / `Heart` | Star/Heart | 收藏/喜欢 |
| `Ban` | Ban | 禁止 |

### Data 数据分析

| 图标 | 名称 | 用途 |
|------|------|------|
| `BarChart2` / `BarChart3` | BarChart* | 柱状图 |
| `LineChart` / `PieChart` | LineChart | 折线/饼图 |
| `TrendingUp` / `TrendingDown` | Trending* | 趋势 |
| `Activity` | Activity | 活动 |
| `Database` | Database | 数据库 |
| `Table` / `Table2` | Table | 表格 |
| `GitBranch` / `GitMerge` | Git* | 版本控制 |
| `Network` / `Workflow` | Network | 工作流 |

### User 用户安全

| 图标 | 名称 | 用途 |
|------|------|------|
| `User` / `Users` | User* | 用户 |
| `UserPlus` / `UserMinus` | UserPlus | 增删用户 |
| `Shield` / `ShieldCheck` | Shield* | 安全 |
| `Key` / `Lock` / `Unlock` | Key/Lock | 密钥/锁 |
| `Eye` / `EyeOff` | Eye* | 显示/隐藏 |

### File 文件媒体

| 图标 | 名称 | 用途 |
|------|------|------|
| `File` / `FileText` / `FileCode` | File* | 文件 |
| `Folder` / `FolderOpen` / `FolderPlus` | Folder* | 文件夹 |
| `Image` / `Video` / `Camera` | Image* | 媒体 |
| `Paperclip` | Paperclip | 附件 |
| `Link` / `Link2` | Link* | 链接 |

### Communication 通信

| 图标 | 名称 | 用途 |
|------|------|------|
| `Mail` | Mail | 邮件 |
| `MessageSquare` / `MessageCircle` | Message* | 消息 |
| `Phone` / `PhoneCall` | Phone* | 电话 |
| `Send` | Send | 发送 |
| `Globe` | Globe | 全球 |

### Commerce 商务

| 图标 | 名称 | 用途 |
|------|------|------|
| `ShoppingCart` | ShoppingCart | 购物车 |
| `CreditCard` | CreditCard | 支付 |
| `DollarSign` / `Euro` | Dollar/Euro | 货币 |
| `Tag` / `Tags` | Tag* | 标签 |
| `Package` / `Truck` | Package | 物流 |
| `Briefcase` / `Building` | Briefcase | 企业 |

### Editor 编辑器

| 图标 | 名称 | 用途 |
|------|------|------|
| `Bold` / `Italic` / `Underline` | Bold* | 文本格式 |
| `Heading1` / `Heading2` / `Heading3` | Heading* | 标题 |
| `List` / `ListOrdered` / `ListTodo` | List* | 列表 |
| `Quote` / `CodeSquare` | Quote | 引用/代码块 |
| `Link` / `Image` / `Table` | Link | 插入 |
| `AlignLeft/Center/Right/Justify` | Align* | 对齐 |
| `Undo2` / `Redo2` | Undo/Redo | 历史 |
| `Terminal` / `SquareTerminal` | Terminal | 终端 |
| `Search` / `Copy` | Search | 编辑器操作 |

## Props

所有图标组件继承 Lucide 的通用 Props：

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| size | `number \| string` | `24` | 图标尺寸 |
| color | `string` | `currentColor` | 颜色 |
| strokeWidth | `number \| string` | `2` | 线条粗细 |
| absoluteStrokeWidth | `boolean` | `false` | 固定线宽不随 size 缩放 |

## 在组件库中的使用

Pro Components 内部已全面使用 `@pro/icons`：

- **CodeEditor** — 工具栏（格式化、搜索、命令面板）
- **RichEditor** — 21 个 toolbar 按钮
- **ProTree** — 展开/折叠箭头、拖拽手柄
- **ProForm** — 分组折叠箭头
- **ProFormField** — tooltip 帮助图标
