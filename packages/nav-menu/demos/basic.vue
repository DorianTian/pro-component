<script setup lang="ts">
import { ref, h } from 'vue'
import { ProNavMenu } from '@pro/nav-menu'
import { ElMessage } from 'element-plus'
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  BarChart3,
  ShieldCheck,
  Bell,
} from 'lucide-vue-next'

import type { NavMenuItem } from '@pro/nav-menu'

const collapsed = ref(false)
const activeKey = ref('dashboard')

const menuItems: NavMenuItem[] = [
  {
    key: 'dashboard',
    label: '工作台',
    icon: LayoutDashboard,
    path: '/dashboard',
  },
  {
    key: 'users',
    label: '用户管理',
    icon: Users,
    badge: 5,
    children: [
      { key: 'users-list', label: '用户列表', path: '/users/list' },
      { key: 'users-roles', label: '角色管理', path: '/users/roles' },
      {
        key: 'users-permissions',
        label: '权限设置',
        path: '/users/permissions',
        icon: ShieldCheck,
      },
    ],
  },
  {
    key: 'content',
    label: '内容管理',
    icon: FileText,
    children: [
      { key: 'content-articles', label: '文章列表', path: '/content/articles' },
      { key: 'content-categories', label: '分类管理', path: '/content/categories' },
    ],
  },
  {
    key: 'analytics',
    label: '数据分析',
    icon: BarChart3,
    dot: true,
    path: '/analytics',
  },
  {
    key: 'notifications',
    label: '通知中心',
    icon: Bell,
    badge: 12,
    path: '/notifications',
  },
  {
    key: 'settings',
    label: '系统设置',
    icon: Settings,
    path: '/settings',
  },
]

function handleSelect(key: string, item: NavMenuItem) {
  ElMessage.info(`选中: ${item.label} (${key})`)
}
</script>

<template>
  <div
    style="
      display: flex;
      height: 420px;
      border: 1px solid var(--pro-border-light);
      border-radius: 8px;
      overflow: hidden;
    "
  >
    <ProNavMenu
      v-model:collapsed="collapsed"
      v-model:active-key="activeKey"
      :items="menuItems"
      :default-open-keys="['users', 'content']"
      @select="handleSelect"
    />
    <div style="flex: 1; padding: 24px; background: var(--pro-bg-base)">
      <p style="color: var(--pro-text-secondary)">
        当前选中: <strong>{{ activeKey }}</strong> | 折叠: {{ collapsed }}
      </p>
    </div>
  </div>
</template>
