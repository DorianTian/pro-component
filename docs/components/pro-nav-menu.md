# ProNavMenu 导航菜单

Schema 驱动的导航菜单组件，支持侧边栏折叠、徽标、路由集成和多级子菜单。

## 基础用法

通过 `items` 数组配置菜单项，支持 `v-model:collapsed` 控制折叠、`v-model:active-key` 控制选中项。

<demo src="../../packages/nav-menu/demos/basic.vue" />

## 水平模式

设置 `mode="horizontal"` 切换为顶部导航栏模式。

<demo src="../../packages/nav-menu/demos/horizontal.vue" />

## API

### Props

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `items` | 菜单项配置数组 | `NavMenuItem[]` | — |
| `mode` | 菜单模式 | `'vertical' \| 'horizontal'` | `'vertical'` |
| `collapsed / v-model` | 侧边栏是否折叠（仅 vertical） | `boolean` | `false` |
| `activeKey / v-model` | 当前选中的菜单项 key | `string` | — |
| `defaultActiveKey` | 默认选中 key（非受控） | `string` | — |
| `defaultOpenKeys` | 默认展开的子菜单 key | `string[]` | `[]` |
| `width` | 侧边栏宽度 (px) | `number` | `240` |
| `collapsedWidth` | 折叠后宽度 (px) | `number` | `64` |
| `showCollapseButton` | 显示折叠按钮 | `boolean` | `true` |
| `router` | 使用 vue-router 导航 | `boolean` | `false` |

### NavMenuItem

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `key` | 唯一标识 | `string` | — |
| `label` | 显示文本 | `string` | — |
| `icon` | 图标组件 | `Component` | — |
| `path` | 路由路径（默认使用 key） | `string` | — |
| `badge` | 徽标数字 | `number` | — |
| `dot` | 显示红点 | `boolean` | `false` |
| `disabled` | 禁用 | `boolean` | `false` |
| `hidden` | 隐藏 | `boolean` | `false` |
| `children` | 子菜单项 | `NavMenuItem[]` | — |
| `isExternal` | 外部链接（新标签页） | `boolean` | `false` |

### Events

| 事件名 | 说明 | 类型 |
| --- | --- | --- |
| `select` | 菜单项选中 | `(key: string, item: NavMenuItem) => void` |
| `update:collapsed` | 折叠状态变化 | `(collapsed: boolean) => void` |
| `update:activeKey` | 选中项变化 | `(key: string) => void` |
