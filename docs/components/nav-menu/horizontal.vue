<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMenu, ElMenuItem, ElSubMenu } from 'element-plus'
import {
  Home,
  Package,
  BookOpen,
  Code,
  Users,
  FileText,
  ShieldCheck,
  BarChart3,
  Settings,
} from 'lucide-vue-next'

const topActive = ref('components')
const sideActive = ref('pro-table')

/** Top-level menu items */
const topItems = [
  { key: 'home', label: '首页', icon: Home },
  { key: 'components', label: '组件', icon: Package },
  { key: 'docs', label: '文档', icon: BookOpen },
  { key: 'api', label: 'API', icon: Code },
]

/** Side sub-menus keyed by top-level item */
const sideMenuMap: Record<
  string,
  { key: string; label: string; icon?: unknown; children?: { key: string; label: string }[] }[]
> = {
  components: [
    {
      key: 'pro',
      label: 'Pro 高阶组件',
      icon: Package,
      children: [
        { key: 'pro-table', label: 'ProTable 表格' },
        { key: 'pro-form', label: 'ProForm 表单' },
        { key: 'pro-descriptions', label: 'ProDescriptions' },
      ],
    },
    {
      key: 'enhanced',
      label: '增强组件',
      icon: BarChart3,
      children: [
        { key: 'pro-tree', label: 'ProTree 树' },
        { key: 'pro-tabs', label: 'ProTabs 标签' },
        { key: 'pro-tag', label: 'ProTag 标签' },
      ],
    },
  ],
  docs: [
    {
      key: 'guide',
      label: '指南',
      icon: BookOpen,
      children: [
        { key: 'intro', label: '介绍' },
        { key: 'getting-started', label: '快速上手' },
        { key: 'cdn-mode', label: 'CDN 模式' },
      ],
    },
  ],
  api: [
    {
      key: 'composables',
      label: 'Composables',
      icon: Code,
      children: [
        { key: 'use-pro-table', label: 'useProTable' },
        { key: 'use-pro-form', label: 'useProForm' },
      ],
    },
  ],
}

const currentSideItems = computed(() => sideMenuMap[topActive.value] ?? [])
const hasSidebar = computed(() => currentSideItems.value.length > 0)
</script>

<template>
  <div class="mix-layout">
    <!-- ═══ Top Header ═══ -->
    <header class="mix-layout__header">
      <div class="mix-layout__logo">
        <svg viewBox="0 0 28 28" width="28" height="28">
          <rect width="28" height="28" rx="7" fill="var(--pro-color-primary, #7c6ce7)" />
          <text x="14" y="20" text-anchor="middle" fill="#fff" font-size="14" font-weight="700">
            P
          </text>
        </svg>
        <span class="mix-layout__logo-text">Pro Admin</span>
      </div>
      <ElMenu
        :default-active="topActive"
        mode="horizontal"
        class="mix-layout__top-menu"
        @select="
          (key: string) => {
            topActive = key
            sideActive = ''
          }
        "
      >
        <ElMenuItem v-for="item in topItems" :key="item.key" :index="item.key">
          <component :is="item.icon" class="mix-layout__top-icon" />
          <span>{{ item.label }}</span>
        </ElMenuItem>
      </ElMenu>
    </header>

    <!-- ═══ Body: Sidebar + Content ═══ -->
    <div class="mix-layout__body">
      <!-- Left sidebar (second-level) -->
      <aside v-if="hasSidebar" class="mix-layout__sidebar">
        <ElMenu
          :default-active="sideActive"
          :default-openeds="currentSideItems.map((g) => g.key)"
          class="mix-layout__side-menu"
          @select="(key: string) => (sideActive = key)"
        >
          <ElSubMenu v-for="group in currentSideItems" :key="group.key" :index="group.key">
            <template #title>
              <component :is="group.icon" v-if="group.icon" class="mix-layout__side-icon" />
              <span>{{ group.label }}</span>
            </template>
            <ElMenuItem v-for="child in group.children" :key="child.key" :index="child.key">
              {{ child.label }}
            </ElMenuItem>
          </ElSubMenu>
        </ElMenu>
      </aside>

      <!-- Content -->
      <main class="mix-layout__content">
        <p v-if="sideActive">
          当前页面: <strong>{{ sideActive }}</strong>
        </p>
        <p v-else style="color: var(--pro-text-tertiary, #a3a3a3)">
          点击顶部导航选择模块，左侧展示二级菜单
        </p>
      </main>
    </div>
  </div>
</template>

<style scoped>
.mix-layout {
  display: flex;
  flex-direction: column;
  height: 440px;
  border: 1px solid var(--pro-border-default, #e5e5e5);
  border-radius: var(--pro-radius-lg, 12px);
  overflow: hidden;
  background: var(--pro-bg-base, #fff);
}

/* ── Header ── */
.mix-layout__header {
  display: flex;
  align-items: center;
  height: 56px;
  padding: 0 20px;
  border-bottom: 1px solid var(--pro-border-light, #f0f0f0);
  background: var(--pro-bg-elevated, #fff);
  flex-shrink: 0;
}
.mix-layout__logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-right: 32px;
  flex-shrink: 0;
}
.mix-layout__logo-text {
  font-size: 16px;
  font-weight: 700;
  color: var(--pro-text-primary, #0a0a0a);
}

/* Top menu — reset EP defaults */
.mix-layout__top-menu {
  border-bottom: none !important;
  height: 56px;
  flex: 1;
}
.mix-layout :deep(.mix-layout__top-menu .el-menu-item) {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 56px;
  line-height: 56px;
  font-size: 14px;
  border-bottom: 2px solid transparent !important;
  padding: 0 16px;
}
.mix-layout :deep(.mix-layout__top-menu .el-menu-item.is-active) {
  border-bottom-color: var(--pro-color-primary, #7c6ce7) !important;
  color: var(--pro-color-primary, #7c6ce7);
  font-weight: 500;
}
.mix-layout__top-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* ── Body ── */
.mix-layout__body {
  display: flex;
  flex: 1;
  min-height: 0;
}

/* ── Sidebar ── */
.mix-layout__sidebar {
  width: 200px;
  border-right: 1px solid var(--pro-border-light, #f0f0f0);
  background: var(--pro-bg-elevated, #fff);
  overflow-y: auto;
  flex-shrink: 0;
}
.mix-layout__side-menu {
  border-right: none !important;
  padding: 8px 0;
}
.mix-layout :deep(.mix-layout__side-menu .el-menu-item) {
  height: 38px;
  line-height: 38px;
  font-size: 13px;
  margin: 1px 6px;
  border-radius: 6px;
  padding-left: 44px !important;
}
.mix-layout :deep(.mix-layout__side-menu .el-sub-menu__title) {
  height: 38px;
  line-height: 38px;
  font-size: 13px;
  font-weight: 500;
  color: var(--pro-text-secondary, #737373);
}
.mix-layout :deep(.mix-layout__side-menu .el-menu-item.is-active) {
  background: var(--pro-color-primary-ultra-light, rgba(124, 108, 231, 0.06));
  color: var(--pro-color-primary, #7c6ce7);
  font-weight: 500;
}
.mix-layout__side-icon {
  width: 15px;
  height: 15px;
  margin-right: 6px;
}

/* ── Content ── */
.mix-layout__content {
  flex: 1;
  padding: 24px;
}
</style>
