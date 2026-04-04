# ProNavMenu 导航菜单

Schema 驱动的侧边导航菜单，支持折叠、徽标和多级子菜单。

## 基础用法

通过 `items` 数组配置菜单项，点击底部按钮可折叠/展开侧边栏。

<demo src="./nav-menu/basic.vue" />

## API

### Props

| 属性名                | 说明                 | 类型            | 默认值  |
| --------------------- | -------------------- | --------------- | ------- |
| `items`               | 菜单项配置数组       | `NavMenuItem[]` | —       |
| `collapsed / v-model` | 侧边栏是否折叠       | `boolean`       | `false` |
| `activeKey / v-model` | 当前选中 key         | `string`        | —       |
| `defaultOpenKeys`     | 默认展开的子菜单 key | `string[]`      | `[]`    |
| `width`               | 展开宽度 (px)        | `number`        | `220`   |
| `collapsedWidth`      | 折叠宽度 (px)        | `number`        | `64`    |

### NavMenuItem

| 属性名     | 说明     | 类型            | 默认值  |
| ---------- | -------- | --------------- | ------- |
| `key`      | 唯一标识 | `string`        | —       |
| `label`    | 显示文本 | `string`        | —       |
| `icon`     | 图标组件 | `Component`     | —       |
| `badge`    | 徽标数字 | `number`        | —       |
| `dot`      | 显示红点 | `boolean`       | `false` |
| `disabled` | 禁用     | `boolean`       | `false` |
| `children` | 子菜单项 | `NavMenuItem[]` | —       |

### Events

| 事件名             | 说明         | 类型                           |
| ------------------ | ------------ | ------------------------------ |
| `update:collapsed` | 折叠状态变化 | `(collapsed: boolean) => void` |
| `update:activeKey` | 选中项变化   | `(key: string) => void`        |
