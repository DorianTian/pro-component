<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMenu, ElMenuItem, ElSubMenu, ElBadge, ElMessage } from 'element-plus'
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  BarChart3,
  Bell,
  ShieldCheck,
  ChevronLeft,
} from 'lucide-vue-next'

const collapsed = ref(false)
const activeKey = ref('dashboard')
const sidebarWidth = computed(() => (collapsed.value ? '64px' : '240px'))

const menuItems = [
  { key: 'dashboard', label: '工作台', icon: LayoutDashboard },
  {
    key: 'users',
    label: '用户管理',
    icon: Users,
    badge: 3,
    children: [
      { key: 'users-list', label: '用户列表' },
      { key: 'users-roles', label: '角色管理' },
      { key: 'users-permissions', label: '权限配置', icon: ShieldCheck },
    ],
  },
  {
    key: 'content',
    label: '内容管理',
    icon: FileText,
    children: [
      { key: 'content-articles', label: '文章管理' },
      { key: 'content-categories', label: '分类管理' },
    ],
  },
  { key: 'analytics', label: '数据分析', icon: BarChart3, dot: true },
  { key: 'notifications', label: '通知中心', icon: Bell, badge: 12 },
  { key: 'settings', label: '系统设置', icon: Settings },
]

function onSelect(key: string) {
  activeKey.value = key
  ElMessage({ message: `导航到: ${key}`, type: 'info', duration: 1500 })
}
</script>

<template>
  <div class="nav-demo">
    <!-- Sidebar -->
    <aside class="nav-demo__sidebar" :style="{ width: sidebarWidth }">
      <!-- Logo -->
      <div class="nav-demo__logo">
        <svg viewBox="0 0 32 32" class="nav-demo__logo-icon">
          <rect width="32" height="32" rx="8" fill="var(--pro-color-primary, #7c6ce7)" />
          <text x="16" y="22" text-anchor="middle" fill="#fff" font-size="16" font-weight="700">
            P
          </text>
        </svg>
        <span v-show="!collapsed" class="nav-demo__logo-text">Pro Admin</span>
      </div>

      <!-- Menu -->
      <ElMenu
        :default-active="activeKey"
        :collapse="collapsed"
        :default-openeds="['users', 'content']"
        :collapse-transition="true"
        class="nav-demo__menu"
        @select="onSelect"
      >
        <template v-for="item in menuItems" :key="item.key">
          <ElSubMenu v-if="item.children" :index="item.key">
            <template #title>
              <component :is="item.icon" class="nav-demo__icon" />
              <span>{{ item.label }}</span>
              <ElBadge v-if="item.badge" :value="item.badge" :max="99" class="nav-demo__badge" />
            </template>
            <ElMenuItem v-for="child in item.children" :key="child.key" :index="child.key">
              <component
                :is="child.icon"
                v-if="child.icon"
                class="nav-demo__icon nav-demo__icon--sub"
              />
              <span>{{ child.label }}</span>
            </ElMenuItem>
          </ElSubMenu>

          <ElMenuItem v-else :index="item.key">
            <component :is="item.icon" class="nav-demo__icon" />
            <template #title>
              <span>{{ item.label }}</span>
              <ElBadge v-if="item.badge" :value="item.badge" :max="99" class="nav-demo__badge" />
              <ElBadge v-else-if="item.dot" is-dot class="nav-demo__badge" />
            </template>
          </ElMenuItem>
        </template>
      </ElMenu>

      <!-- Collapse toggle -->
      <button class="nav-demo__toggle" @click="collapsed = !collapsed">
        <ChevronLeft
          class="nav-demo__toggle-icon"
          :class="{ 'is-collapsed': collapsed }"
          :size="16"
        />
        <span v-show="!collapsed" class="nav-demo__toggle-text">收起菜单</span>
      </button>
    </aside>

    <!-- Main content area -->
    <main class="nav-demo__main">
      <div class="nav-demo__header">
        <span class="nav-demo__breadcrumb">首页 / {{ activeKey }}</span>
      </div>
      <div class="nav-demo__content">
        <p>
          当前页面: <strong>{{ activeKey }}</strong>
        </p>
        <p style="color: var(--pro-text-tertiary, #a3a3a3); margin-top: 8px">
          点击左侧菜单项切换页面，底部按钮控制侧边栏折叠
        </p>
      </div>
    </main>
  </div>
</template>

<style scoped>
.nav-demo {
  display: flex;
  height: 480px;
  border: 1px solid var(--pro-border-default, #e5e5e5);
  border-radius: var(--pro-radius-lg, 12px);
  overflow: hidden;
  background: var(--pro-bg-base, #fff);
}

/* ── Sidebar ── */
.nav-demo__sidebar {
  display: flex;
  flex-direction: column;
  background: var(--pro-bg-elevated, #fff);
  border-right: 1px solid var(--pro-border-light, #f0f0f0);
  transition: width 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
  overflow: hidden;
  flex-shrink: 0;
}

/* ── Logo ── */
.nav-demo__logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px;
  border-bottom: 1px solid var(--pro-border-light, #f0f0f0);
  min-height: 56px;
}
.nav-demo__logo-icon {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}
.nav-demo__logo-text {
  font-size: 16px;
  font-weight: 700;
  color: var(--pro-text-primary, #0a0a0a);
  white-space: nowrap;
  overflow: hidden;
}

/* ── Menu ── */
.nav-demo__menu {
  flex: 1;
  border-right: none !important;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 8px 0;
}
.nav-demo__menu:not(.el-menu--collapse) {
  width: 100%;
}
.nav-demo__icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  margin-right: 8px;
}
.nav-demo__icon--sub {
  width: 15px;
  height: 15px;
  opacity: 0.7;
}

/* Badge positioning */
.nav-demo__badge {
  margin-left: auto;
}

/* Active item highlight */
.nav-demo :deep(.el-menu-item.is-active) {
  background-color: var(--pro-color-primary-ultra-light, rgba(124, 108, 231, 0.06));
  color: var(--pro-color-primary, #7c6ce7);
  font-weight: 500;
}
.nav-demo :deep(.el-menu-item:hover),
.nav-demo :deep(.el-sub-menu__title:hover) {
  background-color: var(--pro-bg-sunken, #f5f5f5);
}
.nav-demo :deep(.el-menu-item),
.nav-demo :deep(.el-sub-menu__title) {
  height: 42px;
  line-height: 42px;
  border-radius: 6px;
  margin: 2px 8px;
  transition: all 0.15s;
}

/* ── Collapse toggle ── */
.nav-demo__toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 44px;
  border: none;
  border-top: 1px solid var(--pro-border-light, #f0f0f0);
  background: transparent;
  color: var(--pro-text-tertiary, #a3a3a3);
  font-size: 13px;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.15s;
}
.nav-demo__toggle:hover {
  color: var(--pro-text-primary, #0a0a0a);
  background: var(--pro-bg-sunken, #f5f5f5);
}
.nav-demo__toggle-icon {
  transition: transform 0.3s;
}
.nav-demo__toggle-icon.is-collapsed {
  transform: rotate(180deg);
}
.nav-demo__toggle-text {
  white-space: nowrap;
}

/* ── Main ── */
.nav-demo__main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.nav-demo__header {
  padding: 16px 24px;
  border-bottom: 1px solid var(--pro-border-light, #f0f0f0);
  font-size: 13px;
  color: var(--pro-text-tertiary, #a3a3a3);
}
.nav-demo__breadcrumb {
  font-weight: 500;
}
.nav-demo__content {
  padding: 24px;
  flex: 1;
}

/* ── Scrollbar ── */
.nav-demo__menu::-webkit-scrollbar {
  width: 4px;
}
.nav-demo__menu::-webkit-scrollbar-thumb {
  background: var(--pro-scrollbar-thumb, #d4d4d4);
  border-radius: 2px;
}
</style>
