<script setup lang="ts">
import { ref, computed, watch, type Component } from 'vue'
import { ElMenu, ElMenuItem, ElSubMenu, ElBadge } from 'element-plus'
import { LayoutDashboard, Users, FileText, Settings, BarChart3, Bell } from 'lucide-vue-next'

/* ── Types ── */
interface NavMenuItem {
  key: string
  label: string
  icon?: Component
  badge?: number
  dot?: boolean
  disabled?: boolean
  children?: NavMenuItem[]
}

/* ── Props ── */
const props = withDefaults(
  defineProps<{
    items?: NavMenuItem[]
    collapsed?: boolean
    activeKey?: string
    defaultOpenKeys?: string[]
    width?: number
    collapsedWidth?: number
  }>(),
  {
    items: undefined,
    collapsed: false,
    activeKey: 'dashboard',
    defaultOpenKeys: () => ['users', 'content'],
    width: 220,
    collapsedWidth: 64,
  },
)

const emit = defineEmits<{
  'update:collapsed': [val: boolean]
  'update:activeKey': [val: string]
}>()

/* ── State ── */
const innerCollapsed = ref(props.collapsed)
const innerActive = ref(props.activeKey)

watch(
  () => props.collapsed,
  (v) => {
    innerCollapsed.value = v
  },
)
watch(
  () => props.activeKey,
  (v) => {
    if (v !== undefined) innerActive.value = v
  },
)

const menuWidth = computed(() => `${innerCollapsed.value ? props.collapsedWidth : props.width}px`)

function toggleCollapse() {
  innerCollapsed.value = !innerCollapsed.value
  emit('update:collapsed', innerCollapsed.value)
}

function handleSelect(key: string) {
  innerActive.value = key
  emit('update:activeKey', key)
}

function visible(children?: NavMenuItem[]) {
  return children?.filter((c) => !c.disabled) ?? []
}

/* ── Demo data ── */
const demoItems: NavMenuItem[] = [
  { key: 'dashboard', label: '工作台', icon: LayoutDashboard },
  {
    key: 'users',
    label: '用户管理',
    icon: Users,
    badge: 5,
    children: [
      { key: 'users-list', label: '用户列表' },
      { key: 'users-roles', label: '角色管理' },
    ],
  },
  {
    key: 'content',
    label: '内容管理',
    icon: FileText,
    children: [
      { key: 'content-articles', label: '文章列表' },
      { key: 'content-categories', label: '分类管理' },
    ],
  },
  { key: 'analytics', label: '数据分析', icon: BarChart3, dot: true },
  { key: 'notifications', label: '通知中心', icon: Bell, badge: 12 },
  { key: 'settings', label: '系统设置', icon: Settings },
]

const menuItems = computed(() => props.items ?? demoItems)
</script>

<template>
  <div
    style="
      display: flex;
      height: 420px;
      border: 1px solid var(--pro-border-light, #f0f0f0);
      border-radius: 8px;
      overflow: hidden;
    "
  >
    <!-- Sidebar -->
    <div class="nav-sidebar" :style="{ width: menuWidth }">
      <ElMenu
        :default-active="innerActive"
        :collapse="innerCollapsed"
        :default-openeds="defaultOpenKeys"
        :collapse-transition="true"
        class="nav-sidebar__menu"
        @select="handleSelect"
      >
        <template v-for="item in menuItems" :key="item.key">
          <!-- Submenu -->
          <ElSubMenu v-if="visible(item.children).length" :index="item.key">
            <template #title>
              <component :is="item.icon" v-if="item.icon" class="nav-icon" />
              <span>{{ item.label }}</span>
            </template>
            <ElMenuItem v-for="child in visible(item.children)" :key="child.key" :index="child.key">
              <component :is="child.icon" v-if="child.icon" class="nav-icon" />
              <span>{{ child.label }}</span>
            </ElMenuItem>
          </ElSubMenu>

          <!-- Leaf -->
          <ElMenuItem v-else :index="item.key">
            <component :is="item.icon" v-if="item.icon" class="nav-icon" />
            <template #title>
              <span>{{ item.label }}</span>
              <ElBadge v-if="item.badge" :value="item.badge" class="nav-badge" />
              <ElBadge v-else-if="item.dot" is-dot class="nav-badge" />
            </template>
          </ElMenuItem>
        </template>
      </ElMenu>

      <!-- Collapse toggle -->
      <button class="nav-toggle" @click="toggleCollapse">
        <svg
          :class="{ 'is-collapsed': innerCollapsed }"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M10 4L6 8L10 12" />
        </svg>
      </button>
    </div>

    <!-- Content -->
    <div style="flex: 1; padding: 24px; background: var(--pro-bg-base, #fff)">
      <p style="color: var(--pro-text-secondary, #737373)">
        当前选中:
        <strong style="color: var(--pro-color-primary, #7c6ce7)">{{ innerActive }}</strong>
        &nbsp;|&nbsp; 折叠: {{ innerCollapsed }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.nav-sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--pro-bg-elevated, #fff);
  border-right: 1px solid var(--pro-border-light, #f0f0f0);
  transition: width 0.25s ease;
  overflow: hidden;
}
.nav-sidebar__menu {
  flex: 1;
  border-right: none !important;
  overflow-y: auto;
}
.nav-icon {
  width: 18px;
  height: 18px;
  margin-right: 8px;
  flex-shrink: 0;
}
.nav-badge {
  margin-left: auto;
}
.nav-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  border: none;
  border-top: 1px solid var(--pro-border-light, #f0f0f0);
  background: transparent;
  color: var(--pro-text-tertiary, #a3a3a3);
  cursor: pointer;
}
.nav-toggle:hover {
  color: var(--pro-text-primary, #0a0a0a);
  background: var(--pro-bg-sunken, #f5f5f5);
}
.nav-toggle svg {
  width: 16px;
  height: 16px;
  transition: transform 0.25s;
}
.nav-toggle svg.is-collapsed {
  transform: rotate(180deg);
}
</style>
