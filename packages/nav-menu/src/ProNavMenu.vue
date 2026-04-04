<script setup lang="ts">
/**
 * ProNavMenu — Schema-driven navigation menu.
 *
 * Features:
 * - Data-driven: pass `items` array instead of writing template slots
 * - Sidebar collapse with smooth transition + toggle button
 * - Badge / dot indicators on menu items
 * - Route-aware active state
 * - Recursive submenu rendering
 * - Horizontal + vertical modes
 * - Dark mode via theme tokens
 */
import { ref, computed, watch } from 'vue'
import { ElMenu, ElMenuItem, ElSubMenu, ElBadge, ElTooltip } from 'element-plus'

import type { NavMenuItem } from './types'

defineOptions({ name: 'ProNavMenu', inheritAttrs: false })

/** Default sidebar width */
const DEFAULT_WIDTH = 240

/** Default collapsed sidebar width */
const DEFAULT_COLLAPSED_WIDTH = 64

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
    backgroundColor?: string
    textColor?: string
    activeTextColor?: string
  }>(),
  {
    mode: 'vertical',
    collapsed: false,
    activeKey: undefined,
    defaultActiveKey: undefined,
    defaultOpenKeys: () => [],
    width: DEFAULT_WIDTH,
    collapsedWidth: DEFAULT_COLLAPSED_WIDTH,
    showCollapseButton: true,
    router: false,
    backgroundColor: undefined,
    textColor: undefined,
    activeTextColor: undefined,
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
  (val) => {
    innerCollapsed.value = val
  },
)

watch(
  () => props.activeKey,
  (val) => {
    if (val !== undefined) innerActiveKey.value = val
  },
)

const visibleItems = computed(() => props.items.filter((item) => !item.hidden))

const menuWidth = computed(() =>
  props.mode === 'vertical'
    ? `${innerCollapsed.value ? props.collapsedWidth : props.width}px`
    : undefined,
)

function toggleCollapse(): void {
  innerCollapsed.value = !innerCollapsed.value
  emit('update:collapsed', innerCollapsed.value)
}

function findItem(items: NavMenuItem[], key: string): NavMenuItem | undefined {
  for (const item of items) {
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
  if (item) {
    if (item.isExternal && item.path) {
      window.open(item.path, '_blank', 'noopener')
      return
    }
    emit('select', key, item)
  }
}
</script>

<template>
  <div
    class="pro-nav-menu"
    :class="{
      'pro-nav-menu--vertical': mode === 'vertical',
      'pro-nav-menu--horizontal': mode === 'horizontal',
      'pro-nav-menu--collapsed': innerCollapsed,
    }"
    :style="{ width: menuWidth }"
  >
    <ElMenu
      :default-active="innerActiveKey"
      :mode="mode"
      :collapse="mode === 'vertical' && innerCollapsed"
      :default-openeds="defaultOpenKeys"
      :background-color="backgroundColor"
      :text-color="textColor"
      :active-text-color="activeTextColor"
      :collapse-transition="true"
      :router="router"
      class="pro-nav-menu__el-menu"
      @select="handleSelect"
    >
      <template v-for="item in visibleItems" :key="item.key">
        <!-- Submenu (has children) -->
        <ElSubMenu
          v-if="item.children?.length"
          :index="item.key"
          :disabled="item.disabled"
          :class="item.className"
        >
          <template #title>
            <component :is="item.icon" v-if="item.icon" class="pro-nav-menu__icon" />
            <span class="pro-nav-menu__label">{{ item.label }}</span>
            <ElBadge
              v-if="item.badge || item.dot"
              :value="item.badge"
              :is-dot="item.dot"
              class="pro-nav-menu__badge"
            />
          </template>
          <!-- Recursive children -->
          <template v-for="child in item.children.filter((c) => !c.hidden)" :key="child.key">
            <ElSubMenu
              v-if="child.children?.length"
              :index="child.key"
              :disabled="child.disabled"
              :class="child.className"
            >
              <template #title>
                <component :is="child.icon" v-if="child.icon" class="pro-nav-menu__icon" />
                <span class="pro-nav-menu__label">{{ child.label }}</span>
              </template>
              <ElMenuItem
                v-for="grandchild in child.children.filter((g) => !g.hidden)"
                :key="grandchild.key"
                :index="grandchild.path ?? grandchild.key"
                :disabled="grandchild.disabled"
                :class="grandchild.className"
              >
                <component
                  :is="grandchild.icon"
                  v-if="grandchild.icon"
                  class="pro-nav-menu__icon"
                />
                <span class="pro-nav-menu__label">{{ grandchild.label }}</span>
              </ElMenuItem>
            </ElSubMenu>
            <ElMenuItem
              v-else
              :index="child.path ?? child.key"
              :disabled="child.disabled"
              :class="child.className"
            >
              <component :is="child.icon" v-if="child.icon" class="pro-nav-menu__icon" />
              <span class="pro-nav-menu__label">{{ child.label }}</span>
              <ElBadge
                v-if="child.badge || child.dot"
                :value="child.badge"
                :is-dot="child.dot"
                class="pro-nav-menu__badge"
              />
            </ElMenuItem>
          </template>
        </ElSubMenu>

        <!-- Leaf menu item -->
        <ElMenuItem
          v-else
          :index="item.path ?? item.key"
          :disabled="item.disabled"
          :class="item.className"
        >
          <ElTooltip
            v-if="innerCollapsed && mode === 'vertical'"
            :content="item.label"
            placement="right"
          >
            <component :is="item.icon" v-if="item.icon" class="pro-nav-menu__icon" />
          </ElTooltip>
          <template v-else>
            <component :is="item.icon" v-if="item.icon" class="pro-nav-menu__icon" />
          </template>
          <span class="pro-nav-menu__label">{{ item.label }}</span>
          <ElBadge
            v-if="item.badge || item.dot"
            :value="item.badge"
            :is-dot="item.dot"
            class="pro-nav-menu__badge"
          />
        </ElMenuItem>
      </template>
    </ElMenu>

    <!-- Collapse toggle button -->
    <button
      v-if="showCollapseButton && mode === 'vertical'"
      class="pro-nav-menu__collapse-btn"
      type="button"
      role="button"
      tabindex="0"
      :aria-label="innerCollapsed ? 'Expand' : 'Collapse'"
      @click="toggleCollapse"
      @keydown.enter.space.prevent="toggleCollapse"
    >
      <svg
        class="pro-nav-menu__collapse-icon"
        :class="{ 'pro-nav-menu__collapse-icon--collapsed': innerCollapsed }"
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
  background: var(--pro-bg-elevated);
  border-right: 1px solid var(--pro-border-light);
  transition: width 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
  overflow: hidden;
  height: 100%;
  font-family: var(--pro-font-family);
}

.pro-nav-menu--horizontal {
  flex-direction: row;
  border-right: none;
  border-bottom: 1px solid var(--pro-border-light);
  height: auto;
  width: auto !important;
}

/* ─── ElMenu overrides ────────────────────────────────────────────── */
.pro-nav-menu .pro-nav-menu__el-menu {
  border-right: none !important;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  background: transparent !important;
}

.pro-nav-menu .el-menu-item,
.pro-nav-menu .el-sub-menu__title {
  height: 44px;
  line-height: 44px;
  font-size: var(--pro-text-sm);
  color: var(--pro-text-secondary);
  transition: all var(--pro-transition-fast);
  border-radius: var(--pro-radius-sm);
  margin: 2px 8px;
  padding: 0 12px !important;
}

.pro-nav-menu--collapsed .el-menu-item,
.pro-nav-menu--collapsed .el-sub-menu__title {
  margin: 2px 4px;
  padding: 0 !important;
  justify-content: center;
}

.pro-nav-menu .el-menu-item:hover,
.pro-nav-menu .el-sub-menu__title:hover {
  background: var(--pro-bg-sunken) !important;
  color: var(--pro-text-primary);
}

.pro-nav-menu .el-menu-item.is-active {
  background: var(--pro-color-primary-ultra-light, rgba(124, 108, 231, 0.08)) !important;
  color: var(--pro-color-primary) !important;
  font-weight: 500;
}

/* ─── Icon ────────────────────────────────────────────────────────── */
.pro-nav-menu__icon {
  width: 18px;
  height: 18px;
  margin-right: 8px;
  flex-shrink: 0;
}

.pro-nav-menu--collapsed .pro-nav-menu__icon {
  margin-right: 0;
}

/* ─── Label (hidden when collapsed) ──────────────────────────────── */
.pro-nav-menu--collapsed .pro-nav-menu__label {
  display: none;
}

/* ─── Badge ───────────────────────────────────────────────────────── */
.pro-nav-menu__badge {
  margin-left: auto;
}

.pro-nav-menu--collapsed .pro-nav-menu__badge {
  position: absolute;
  top: 8px;
  right: 8px;
  margin-left: 0;
}

/* ─── Collapse button ─────────────────────────────────────────────── */
.pro-nav-menu__collapse-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  border: none;
  border-top: 1px solid var(--pro-border-light);
  background: transparent;
  color: var(--pro-text-tertiary);
  cursor: pointer;
  transition: all var(--pro-transition-fast);
  flex-shrink: 0;
}

.pro-nav-menu__collapse-btn:hover {
  color: var(--pro-text-primary);
  background: var(--pro-bg-sunken);
}

.pro-nav-menu__collapse-icon {
  width: 16px;
  height: 16px;
  transition: transform 0.3s ease;
}

.pro-nav-menu__collapse-icon--collapsed {
  transform: rotate(180deg);
}

/* ─── Scrollbar ───────────────────────────────────────────────────── */
.pro-nav-menu .pro-nav-menu__el-menu::-webkit-scrollbar {
  width: var(--pro-scrollbar-size);
}

.pro-nav-menu .pro-nav-menu__el-menu::-webkit-scrollbar-thumb {
  background: var(--pro-scrollbar-thumb);
  border-radius: var(--pro-radius-full);
}

.pro-nav-menu .pro-nav-menu__el-menu::-webkit-scrollbar-track {
  background: transparent;
}
</style>
