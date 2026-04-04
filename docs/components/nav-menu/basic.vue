<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMenu, ElMenuItem, ElSubMenu, ElBadge } from 'element-plus'
import { LayoutDashboard, Users, FileText, Settings, BarChart3, Bell } from 'lucide-vue-next'

const collapsed = ref(false)
const activeKey = ref('dashboard')
const width = computed(() => (collapsed.value ? '64px' : '220px'))

const items = [
  { key: 'dashboard', label: '工作台', icon: LayoutDashboard },
  {
    key: 'users',
    label: '用户管理',
    icon: Users,
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
  { key: 'analytics', label: '数据分析', icon: BarChart3 },
  { key: 'notifications', label: '通知中心', icon: Bell },
  { key: 'settings', label: '系统设置', icon: Settings },
]
</script>

<template>
  <div style="display: flex; height: 400px; border: 1px solid #f0f0f0; border-radius: 8px; overflow: hidden">
    <div :style="{ width, transition: 'width .25s', overflow: 'hidden', borderRight: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column' }">
      <ElMenu
        :default-active="activeKey"
        :collapse="collapsed"
        :default-openeds="['users', 'content']"
        style="flex: 1; border-right: none"
        @select="(key: string) => (activeKey = key)"
      >
        <template v-for="item in items" :key="item.key">
          <ElSubMenu v-if="item.children" :index="item.key">
            <template #title>
              <component :is="item.icon" v-if="item.icon" style="width: 18px; height: 18px; margin-right: 8px" />
              <span>{{ item.label }}</span>
            </template>
            <ElMenuItem v-for="child in item.children" :key="child.key" :index="child.key">
              {{ child.label }}
            </ElMenuItem>
          </ElSubMenu>
          <ElMenuItem v-else :index="item.key">
            <component :is="item.icon" v-if="item.icon" style="width: 18px; height: 18px; margin-right: 8px" />
            <template #title>{{ item.label }}</template>
          </ElMenuItem>
        </template>
      </ElMenu>
      <button
        style="height: 40px; border: none; border-top: 1px solid #f0f0f0; background: transparent; cursor: pointer; color: #a3a3a3"
        @click="collapsed = !collapsed"
      >
        {{ collapsed ? '▶' : '◀' }}
      </button>
    </div>
    <div style="flex: 1; padding: 24px">
      <p>当前选中: <strong>{{ activeKey }}</strong></p>
    </div>
  </div>
</template>
