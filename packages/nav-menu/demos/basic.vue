<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { LayoutDashboard, Users, FileText, Settings, BarChart3, Bell } from 'lucide-vue-next'

const collapsed = ref(false)
const activeKey = ref('dashboard')

const menuItems = [
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

function handleSelect(key: string) {
  ElMessage.info(`选中: ${key}`)
}
</script>

<template>
  <div
    style="
      display: flex;
      height: 400px;
      border: 1px solid var(--pro-border-light, #f0f0f0);
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
    <div style="flex: 1; padding: 24px">
      <p>
        当前选中: <strong>{{ activeKey }}</strong>
      </p>
    </div>
  </div>
</template>
