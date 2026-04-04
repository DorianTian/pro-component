<script setup lang="ts">
import { ref } from 'vue'
import { ProNavMenu } from '@pro/nav-menu'
import { Home, Package, BookOpen, Github } from 'lucide-vue-next'

import type { NavMenuItem } from '@pro/nav-menu'

const activeKey = ref('home')

const menuItems: NavMenuItem[] = [
  { key: 'home', label: '首页', icon: Home },
  { key: 'components', label: '组件', icon: Package },
  { key: 'docs', label: '文档', icon: BookOpen },
  {
    key: 'github',
    label: 'GitHub',
    icon: Github,
    isExternal: true,
    path: 'https://github.com/DorianTian/pro-component',
  },
]
</script>

<template>
  <ProNavMenu
    v-model:active-key="activeKey"
    :items="menuItems"
    mode="horizontal"
    :show-collapse-button="false"
  />
</template>
