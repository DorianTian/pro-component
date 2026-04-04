# ProNavMenu 导航菜单

Schema 驱动的导航菜单，支持侧边栏折叠、徽标提示、子菜单分组和水平模式。

## 侧边栏模式

完整的后台管理侧边栏：Logo 区域 + 可折叠菜单 + 徽标通知 + 底部折叠按钮。

<demo vue="./nav-menu/basic.vue" />

## 水平模式

顶部导航栏，支持下拉子菜单。

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
