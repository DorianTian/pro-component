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

<ApiTable :data="[
  { prop: 'items', type: 'NavMenuItem[]', default: '—', desc: '菜单项配置数组' },
  { prop: 'mode', type: '\'vertical\' | \'horizontal\'', default: '\'vertical\'', desc: '菜单模式' },
  { prop: 'collapsed / v-model:collapsed', type: 'boolean', default: 'false', desc: '侧边栏是否折叠（仅 vertical 模式）' },
  { prop: 'activeKey / v-model:activeKey', type: 'string', default: '—', desc: '当前选中的菜单项 key' },
  { prop: 'defaultActiveKey', type: 'string', default: '—', desc: '默认选中的菜单项 key（非受控）' },
  { prop: 'defaultOpenKeys', type: 'string[]', default: '[]', desc: '默认展开的子菜单 key 数组' },
  { prop: 'width', type: 'number', default: '240', desc: '侧边栏宽度（px）' },
  { prop: 'collapsedWidth', type: 'number', default: '64', desc: '折叠后宽度（px）' },
  { prop: 'showCollapseButton', type: 'boolean', default: 'true', desc: '是否显示折叠按钮' },
  { prop: 'router', type: 'boolean', default: 'false', desc: '是否使用 vue-router 进行导航' },
]" />

### NavMenuItem

<ApiTable :data="[
  { prop: 'key', type: 'string', default: '—', desc: '唯一标识，也用作路由路径（当 path 未指定时）' },
  { prop: 'label', type: 'string', default: '—', desc: '菜单项显示文本' },
  { prop: 'icon', type: 'Component', default: '—', desc: '菜单图标组件' },
  { prop: 'path', type: 'string', default: '—', desc: '路由路径，默认使用 key' },
  { prop: 'badge', type: 'number', default: '—', desc: '徽标数字' },
  { prop: 'dot', type: 'boolean', default: 'false', desc: '是否显示红点（替代数字徽标）' },
  { prop: 'disabled', type: 'boolean', default: 'false', desc: '是否禁用' },
  { prop: 'hidden', type: 'boolean', default: 'false', desc: '是否隐藏' },
  { prop: 'children', type: 'NavMenuItem[]', default: '—', desc: '子菜单项' },
  { prop: 'isExternal', type: 'boolean', default: 'false', desc: '是否为外部链接（新标签页打开）' },
]" />

### Events

<ApiTable :data="[
  { prop: 'select', type: '(key: string, item: NavMenuItem) => void', default: '—', desc: '菜单项被选中时触发' },
  { prop: 'update:collapsed', type: '(collapsed: boolean) => void', default: '—', desc: '折叠状态变化时触发' },
  { prop: 'update:activeKey', type: '(key: string) => void', default: '—', desc: '选中项变化时触发' },
]" />
