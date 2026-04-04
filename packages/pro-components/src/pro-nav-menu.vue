<script setup lang="ts">
/**
 * ProNavMenu — Schema-driven navigation menu.
 * Self-contained: no @pro/hooks dependency, works standalone.
 */
import { ref, computed, watch, type Component } from 'vue'
import { ElMenu, ElMenuItem, ElSubMenu, ElBadge } from 'element-plus'

export interface NavMenuItem {
  key: string
  label: string
  icon?: Component
  path?: string
  badge?: number
  dot?: boolean
  disabled?: boolean
  hidden?: boolean
  children?: NavMenuItem[]
  isExternal?: boolean
}

defineOptions({ name: 'ProNavMenu', inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    items: NavMenuItem[]
    mode?: 'vertical' | 'horizontal'
    collapsed?: boolean
    activeKey?: string
    defaultActiveKey?: string
    defaultOpenKeys?: string[]
    width?: number
    collapsedWidth?: number
    showCollapseButton?: boolean
    router?: boolean
  }>(),
  {
    mode: 'vertical',
    collapsed: false,
    activeKey: undefined,
    defaultActiveKey: undefined,
    defaultOpenKeys: () => [],
    width: 220,
    collapsedWidth: 64,
    showCollapseButton: true,
    router: false,
  },
)

const emit = defineEmits<{
  select: [key: string, item: NavMenuItem]
  'update:collapsed': [collapsed: boolean]
  'update:activeKey': [key: string]
}>()

const innerCollapsed = ref(props.collapsed)
const innerActiveKey = ref(props.activeKey ?? props.defaultActiveKey ?? '')

watch(
  () => props.collapsed,
  (v) => {
    innerCollapsed.value = v
  },
)
watch(
  () => props.activeKey,
  (v) => {
    if (v !== undefined) innerActiveKey.value = v
  },
)

const visibleItems = computed(() => props.items.filter((i) => !i.hidden))

const menuWidth = computed(() =>
  props.mode === 'vertical'
    ? `${innerCollapsed.value ? props.collapsedWidth : props.width}px`
    : undefined,
)

function toggleCollapse(): void {
  innerCollapsed.value = !innerCollapsed.value
  emit('update:collapsed', innerCollapsed.value)
}

function findItem(list: NavMenuItem[], key: string): NavMenuItem | undefined {
  for (const item of list) {
    if (item.key === key) return item
    if (item.children) {
      const found = findItem(item.children, key)
      if (found) return found
    }
  }
  return undefined
}

function handleSelect(key: string): void {
  innerActiveKey.value = key
  emit('update:activeKey', key)
  const item = findItem(props.items, key)
  if (!item) return
  if (item.isExternal && item.path) {
    window.open(item.path, '_blank', 'noopener')
    return
  }
  emit('select', key, item)
}

function visibleChildren(children?: NavMenuItem[]): NavMenuItem[] {
  return children?.filter((c) => !c.hidden) ?? []
}
</script>

<template>
  <div
    class="pro-nav-menu"
    :class="{
      'pro-nav-menu--vertical': mode === 'vertical',
      'pro-nav-menu--horizontal': mode === 'horizontal',
      'pro-nav-menu--collapsed': innerCollapsed && mode === 'vertical',
    }"
    :style="{ width: menuWidth }"
  >
    <ElMenu
      :default-active="innerActiveKey"
      :mode="mode"
      :collapse="mode === 'vertical' && innerCollapsed"
      :default-openeds="defaultOpenKeys"
      :collapse-transition="true"
      :router="router"
      class="pro-nav-menu__menu"
      @select="handleSelect"
    >
      <template v-for="item in visibleItems" :key="item.key">
        <!-- ── Submenu ── -->
        <ElSubMenu
          v-if="visibleChildren(item.children).length"
          :index="item.key"
          :disabled="item.disabled"
        >
          <template #title>
            <component :is="item.icon" v-if="item.icon" class="pro-nav-menu__icon" />
            <span>{{ item.label }}</span>
          </template>
          <template v-for="child in visibleChildren(item.children)" :key="child.key">
            <!-- Nested submenu (level 2) -->
            <ElSubMenu
              v-if="visibleChildren(child.children).length"
              :index="child.key"
              :disabled="child.disabled"
            >
              <template #title>
                <component :is="child.icon" v-if="child.icon" class="pro-nav-menu__icon" />
                <span>{{ child.label }}</span>
              </template>
              <ElMenuItem
                v-for="gc in visibleChildren(child.children)"
                :key="gc.key"
                :index="gc.path ?? gc.key"
                :disabled="gc.disabled"
              >
                <component :is="gc.icon" v-if="gc.icon" class="pro-nav-menu__icon" />
                <span>{{ gc.label }}</span>
              </ElMenuItem>
            </ElSubMenu>
            <!-- Leaf child -->
            <ElMenuItem v-else :index="child.path ?? child.key" :disabled="child.disabled">
              <component :is="child.icon" v-if="child.icon" class="pro-nav-menu__icon" />
              <span>{{ child.label }}</span>
              <ElBadge v-if="child.badge" :value="child.badge" class="pro-nav-menu__badge" />
              <ElBadge v-else-if="child.dot" is-dot class="pro-nav-menu__badge" />
            </ElMenuItem>
          </template>
        </ElSubMenu>

        <!-- ── Leaf item ── -->
        <ElMenuItem v-else :index="item.path ?? item.key" :disabled="item.disabled">
          <component :is="item.icon" v-if="item.icon" class="pro-nav-menu__icon" />
          <template #title>
            <span>{{ item.label }}</span>
            <ElBadge v-if="item.badge" :value="item.badge" class="pro-nav-menu__badge" />
            <ElBadge v-else-if="item.dot" is-dot class="pro-nav-menu__badge" />
          </template>
        </ElMenuItem>
      </template>
    </ElMenu>

    <!-- Collapse toggle -->
    <button
      v-if="showCollapseButton && mode === 'vertical'"
      class="pro-nav-menu__toggle"
      type="button"
      tabindex="0"
      :aria-label="innerCollapsed ? 'Expand' : 'Collapse'"
      @click="toggleCollapse"
      @keydown.enter.space.prevent="toggleCollapse"
    >
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
</template>

<style>
.pro-nav-menu {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--pro-bg-elevated, #fff);
  border-right: 1px solid var(--pro-border-light, #f0f0f0);
  transition: width 0.25s ease;
  overflow: hidden;
}
.pro-nav-menu--horizontal {
  flex-direction: row;
  height: auto;
  width: auto !important;
  border-right: none;
  border-bottom: 1px solid var(--pro-border-light, #f0f0f0);
}
.pro-nav-menu__menu {
  flex: 1;
  border-right: none !important;
  overflow-y: auto;
  overflow-x: hidden;
  background: transparent !important;
}
.pro-nav-menu__icon {
  width: 18px;
  height: 18px;
  margin-right: 8px;
  flex-shrink: 0;
  vertical-align: middle;
}
.pro-nav-menu--collapsed .pro-nav-menu__icon {
  margin-right: 0;
}
.pro-nav-menu__badge {
  margin-left: auto;
  vertical-align: middle;
}
.pro-nav-menu--collapsed .pro-nav-menu__badge {
  position: absolute;
  top: 6px;
  right: 6px;
}

/* ── Collapse toggle ── */
.pro-nav-menu__toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  border: none;
  border-top: 1px solid var(--pro-border-light, #f0f0f0);
  background: transparent;
  color: var(--pro-text-tertiary, #a3a3a3);
  cursor: pointer;
  flex-shrink: 0;
  transition:
    color 0.15s,
    background 0.15s;
}
.pro-nav-menu__toggle:hover {
  color: var(--pro-text-primary, #0a0a0a);
  background: var(--pro-bg-sunken, #f5f5f5);
}
.pro-nav-menu__toggle svg {
  width: 16px;
  height: 16px;
  transition: transform 0.25s ease;
}
.pro-nav-menu__toggle svg.is-collapsed {
  transform: rotate(180deg);
}

/* ── Active item style ── */
.pro-nav-menu .el-menu-item.is-active {
  background-color: var(--pro-color-primary-ultra-light, rgba(124, 108, 231, 0.08)) !important;
  color: var(--pro-color-primary, #7c6ce7) !important;
}

/* ── Scrollbar ── */
.pro-nav-menu__menu::-webkit-scrollbar {
  width: 4px;
}
.pro-nav-menu__menu::-webkit-scrollbar-thumb {
  background: var(--pro-scrollbar-thumb, #d4d4d4);
  border-radius: 2px;
}
</style>
