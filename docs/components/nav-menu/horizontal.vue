<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  ElMenu,
  ElMenuItem,
  ElSubMenu,
  ElIcon,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElSwitch,
  ElAvatar,
} from 'element-plus'
import {
  Home,
  Package,
  BookOpen,
  Code,
  BarChart3,
  Bell,
  Globe,
  Moon,
  Sun,
  User,
  LogOut,
  Settings,
} from 'lucide-vue-next'

const topActive = ref('components')
const sideActive = ref('pro-table')
const isDark = ref(false)
const lang = ref('zh-CN')

const topItems = [
  { key: 'home', label: '首页', icon: Home },
  { key: 'components', label: '组件', icon: Package },
  { key: 'docs', label: '文档', icon: BookOpen },
  { key: 'api', label: 'API', icon: Code },
]

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

      <!-- Top nav -->
      <nav class="mix-layout__top-nav">
        <a
          v-for="item in topItems"
          :key="item.key"
          class="mix-layout__top-item"
          :class="{ 'is-active': topActive === item.key }"
          href="javascript:void(0)"
          @click="
            topActive = item.key
            sideActive = ''
          "
        >
          {{ item.label }}
        </a>
      </nav>

      <!-- Right actions -->
      <div class="mix-layout__actions">
        <!-- Notification -->
        <button class="mix-layout__action-btn" title="通知">
          <Bell :size="16" />
        </button>

        <!-- Language -->
        <ElDropdown trigger="click" @command="(cmd: string) => (lang = cmd)">
          <button class="mix-layout__action-btn" title="语言">
            <Globe :size="16" />
          </button>
          <template #dropdown>
            <ElDropdownMenu>
              <ElDropdownItem command="zh-CN" :class="{ 'is-active': lang === 'zh-CN' }"
                >简体中文</ElDropdownItem
              >
              <ElDropdownItem command="en-US" :class="{ 'is-active': lang === 'en-US' }"
                >English</ElDropdownItem
              >
            </ElDropdownMenu>
          </template>
        </ElDropdown>

        <!-- Theme toggle -->
        <button class="mix-layout__action-btn" title="主题" @click="isDark = !isDark">
          <Moon v-if="!isDark" :size="16" />
          <Sun v-else :size="16" />
        </button>

        <!-- User -->
        <ElDropdown trigger="click">
          <div class="mix-layout__user">
            <ElAvatar :size="28" style="background: var(--pro-color-primary, #7c6ce7)">D</ElAvatar>
          </div>
          <template #dropdown>
            <ElDropdownMenu>
              <ElDropdownItem><Settings :size="14" style="margin-right: 6px" />设置</ElDropdownItem>
              <ElDropdownItem divided
                ><LogOut :size="14" style="margin-right: 6px" />退出登录</ElDropdownItem
              >
            </ElDropdownMenu>
          </template>
        </ElDropdown>
      </div>
    </header>

    <!-- ═══ Body ═══ -->
    <div class="mix-layout__body">
      <aside v-if="hasSidebar" class="mix-layout__sidebar">
        <ElMenu
          :default-active="sideActive"
          :default-openeds="currentSideItems.map((g) => g.key)"
          class="mix-layout__side-menu"
          @select="(key: string) => (sideActive = key)"
        >
          <ElSubMenu v-for="group in currentSideItems" :key="group.key" :index="group.key">
            <template #title>
              <el-icon v-if="group.icon" :size="15"><component :is="group.icon" /></el-icon>
              <span>{{ group.label }}</span>
            </template>
            <ElMenuItem v-for="child in group.children" :key="child.key" :index="child.key">
              {{ child.label }}
            </ElMenuItem>
          </ElSubMenu>
        </ElMenu>
      </aside>
      <main class="mix-layout__content">
        <p v-if="sideActive">
          当前页面: <strong>{{ sideActive }}</strong>
        </p>
        <p v-else style="color: #a3a3a3">点击顶部导航选择模块</p>
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
  border-radius: 12px;
  overflow: hidden;
}

/* ── Header ── */
.mix-layout__header {
  display: flex;
  align-items: center;
  height: 52px;
  padding: 0 16px;
  border-bottom: 1px solid var(--pro-border-light, #f0f0f0);
  background: var(--pro-bg-elevated, #fff);
  flex-shrink: 0;
  gap: 8px;
}
.mix-layout__logo {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 24px;
  flex-shrink: 0;
}
.mix-layout__logo-text {
  font-size: 15px;
  font-weight: 700;
}

/* Top nav — plain links, no ElMenu overhead */
.mix-layout__top-nav {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
}
.mix-layout__top-item {
  padding: 6px 14px;
  font-size: 14px;
  color: var(--pro-text-secondary, #737373);
  text-decoration: none;
  border-radius: 6px;
  transition: all 0.15s;
}
.mix-layout__top-item:hover {
  color: var(--pro-text-primary, #0a0a0a);
  background: var(--pro-bg-sunken, #f5f5f5);
}
.mix-layout__top-item.is-active {
  color: var(--pro-color-primary, #7c6ce7);
  font-weight: 600;
}

/* Right actions */
.mix-layout__actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}
.mix-layout__action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--pro-text-secondary, #737373);
  cursor: pointer;
  transition: all 0.15s;
}
.mix-layout__action-btn:hover {
  background: var(--pro-bg-sunken, #f5f5f5);
  color: var(--pro-text-primary, #0a0a0a);
}
.mix-layout__user {
  cursor: pointer;
  margin-left: 4px;
}

/* ── Body ── */
.mix-layout__body {
  display: flex;
  flex: 1;
  min-height: 0;
}

.mix-layout__sidebar {
  width: 200px;
  border-right: 1px solid var(--pro-border-light, #f0f0f0);
  overflow-y: auto;
  flex-shrink: 0;
}
.mix-layout__side-menu {
  border-right: none !important;
  padding: 8px 0;
}
.mix-layout :deep(.mix-layout__side-menu .el-menu-item) {
  height: 36px;
  line-height: 36px;
  font-size: 13px;
  margin: 1px 6px;
  border-radius: 6px;
}
.mix-layout :deep(.mix-layout__side-menu .el-sub-menu__title) {
  height: 36px;
  line-height: 36px;
  font-size: 13px;
  font-weight: 500;
  color: var(--pro-text-secondary, #737373);
}
.mix-layout :deep(.mix-layout__side-menu .el-menu-item.is-active) {
  background: var(--pro-color-primary-ultra-light, rgba(124, 108, 231, 0.06));
  color: var(--pro-color-primary, #7c6ce7);
  font-weight: 500;
}

.mix-layout__content {
  flex: 1;
  padding: 24px;
}
</style>
