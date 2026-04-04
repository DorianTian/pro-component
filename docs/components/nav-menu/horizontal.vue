<script setup lang="ts">
import { ref } from 'vue'
import { ElMenu, ElMenuItem, ElSubMenu } from 'element-plus'
import { Home, Package, BookOpen, Code, ExternalLink } from 'lucide-vue-next'

const activeKey = ref('home')

const menuItems = [
  { key: 'home', label: '首页', icon: Home },
  {
    key: 'components',
    label: '组件',
    icon: Package,
    children: [
      { key: 'pro-table', label: 'ProTable 表格' },
      { key: 'pro-form', label: 'ProForm 表单' },
      { key: 'pro-descriptions', label: 'ProDescriptions 详情' },
    ],
  },
  { key: 'docs', label: '文档', icon: BookOpen },
  { key: 'api', label: 'API', icon: Code },
]
</script>

<template>
  <div
    style="
      border: 1px solid var(--pro-border-default, #e5e5e5);
      border-radius: 8px;
      overflow: hidden;
    "
  >
    <ElMenu
      :default-active="activeKey"
      mode="horizontal"
      @select="(key: string) => (activeKey = key)"
    >
      <template v-for="item in menuItems" :key="item.key">
        <ElSubMenu v-if="item.children" :index="item.key">
          <template #title>
            <component :is="item.icon" style="width: 16px; height: 16px; margin-right: 6px" />
            {{ item.label }}
          </template>
          <ElMenuItem v-for="child in item.children" :key="child.key" :index="child.key">
            {{ child.label }}
          </ElMenuItem>
        </ElSubMenu>
        <ElMenuItem v-else :index="item.key">
          <component :is="item.icon" style="width: 16px; height: 16px; margin-right: 6px" />
          {{ item.label }}
        </ElMenuItem>
      </template>
    </ElMenu>
    <div style="padding: 24px; color: var(--pro-text-secondary, #737373)">
      当前选中: <strong>{{ activeKey }}</strong>
    </div>
  </div>
</template>
