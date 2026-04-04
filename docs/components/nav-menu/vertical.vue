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
  <div class="side-demo">
    <aside class="side-demo__nav" :style="{ width: sidebarWidth }">
      <!-- Logo -->
      <div class="side-demo__logo">
        <svg viewBox="0 0 32 32" width="32" height="32" style="flex-shrink: 0">
          <rect width="32" height="32" rx="8" fill="var(--pro-color-primary, #7c6ce7)" />
          <text x="16" y="22" text-anchor="middle" fill="#fff" font-size="16" font-weight="700">
            P
          </text>
        </svg>
        <span v-show="!collapsed" class="side-demo__logo-text">Pro Admin</span>
      </div>

      <!-- Menu -->
      <ElMenu
        :default-active="activeKey"
        :collapse="collapsed"
        :default-openeds="['users', 'content']"
        :collapse-transition="true"
        class="side-demo__menu"
        @select="onSelect"
      >
        <template v-for="item in menuItems" :key="item.key">
          <ElSubMenu v-if="item.children" :index="item.key">
            <template #title>
              <el-icon :size="18"><component :is="item.icon" /></el-icon>
              <span>{{ item.label }}</span>
              <ElBadge v-if="item.badge" :value="item.badge" :max="99" class="side-demo__badge" />
            </template>
            <ElMenuItem v-for="child in item.children" :key="child.key" :index="child.key">
              <el-icon v-if="child.icon" :size="15"><component :is="child.icon" /></el-icon>
              <span>{{ child.label }}</span>
            </ElMenuItem>
          </ElSubMenu>

          <ElMenuItem v-else :index="item.key">
            <el-icon :size="18"><component :is="item.icon" /></el-icon>
            <template #title>
              <span>{{ item.label }}</span>
              <ElBadge v-if="item.badge" :value="item.badge" :max="99" class="side-demo__badge" />
              <ElBadge v-else-if="item.dot" is-dot class="side-demo__badge" />
            </template>
          </ElMenuItem>
        </template>
      </ElMenu>

      <!-- Collapse toggle -->
      <button class="side-demo__toggle" @click="collapsed = !collapsed">
        <ChevronLeft
          class="side-demo__toggle-icon"
          :class="{ 'is-collapsed': collapsed }"
          :size="16"
        />
        <span v-show="!collapsed">收起菜单</span>
      </button>
    </aside>

    <main class="side-demo__main">
      <p>
        当前页面: <strong>{{ activeKey }}</strong>
      </p>
      <p class="side-demo__hint">点击左侧菜单项切换页面，底部按钮控制折叠</p>
    </main>
  </div>
</template>

<style scoped>
.side-demo {
  display: flex;
  height: 480px;
  border: 1px solid var(--pro-border-default, #e5e5e5);
  border-radius: 12px;
  overflow: hidden;
}

.side-demo__nav {
  display: flex;
  flex-direction: column;
  background: var(--pro-bg-elevated, #fff);
  border-right: 1px solid var(--pro-border-light, #f0f0f0);
  transition: width 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
  overflow: hidden;
  flex-shrink: 0;
}

.side-demo__logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px;
  min-height: 56px;
  border-bottom: 1px solid var(--pro-border-light, #f0f0f0);
}
.side-demo__logo-text {
  font-size: 16px;
  font-weight: 700;
  white-space: nowrap;
}

.side-demo__menu {
  flex: 1;
  border-right: none !important;
  overflow-y: auto;
  padding: 4px 0;
}
.side-demo__menu:not(.el-menu--collapse) {
  width: 100%;
}

/* Badge — position next to the expand arrow in sub-menu title */
.side-demo__badge {
  position: absolute;
  right: 40px;
  top: 50%;
  transform: translateY(-50%);
}

/* Toggle */
.side-demo__toggle {
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
}
.side-demo__toggle:hover {
  color: var(--pro-text-primary, #0a0a0a);
  background: var(--pro-bg-sunken, #f5f5f5);
}
.side-demo__toggle-icon {
  transition: transform 0.3s;
}
.side-demo__toggle-icon.is-collapsed {
  transform: rotate(180deg);
}

.side-demo__main {
  flex: 1;
  padding: 24px;
}
.side-demo__hint {
  color: var(--pro-text-tertiary, #a3a3a3);
  margin-top: 8px;
}

/* Scrollbar */
.side-demo__menu::-webkit-scrollbar {
  width: 4px;
}
.side-demo__menu::-webkit-scrollbar-thumb {
  background: #d4d4d4;
  border-radius: 2px;
}
</style>
