# ProNavMenu 导航菜单

Schema 驱动的导航菜单，支持侧边栏折叠、徽标提示、子菜单分组和混合布局。

## 垂直侧边栏

纯侧边导航：Logo + 可折叠菜单 + 徽标 + 子菜单 + 折叠按钮。

<demo vue="./nav-menu/vertical.vue" />

## 顶部 + 左侧混合布局

顶部主导航切换模块，左侧联动展示二级菜单。顶栏右侧支持通知、语言切换、主题切换、用户菜单等操作入口。

<demo vue="./nav-menu/horizontal.vue" />

## API

### NavMenuItem 数据结构

| 属性名       | 说明                     | 类型            | 默认值  |
| ------------ | ------------------------ | --------------- | ------- |
| `key`        | 唯一标识                 | `string`        | —       |
| `label`      | 显示文本                 | `string`        | —       |
| `icon`       | 图标组件 (Vue Component) | `Component`     | —       |
| `badge`      | 徽标数字                 | `number`        | —       |
| `dot`        | 显示红点提示             | `boolean`       | `false` |
| `disabled`   | 禁用                     | `boolean`       | `false` |
| `children`   | 子菜单项                 | `NavMenuItem[]` | —       |
| `isExternal` | 外部链接（新标签页）     | `boolean`       | `false` |
| `path`       | 自定义路由路径           | `string`        | —       |
