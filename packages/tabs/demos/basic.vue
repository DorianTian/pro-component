<script setup lang="ts">
import { ref } from 'vue'
import { ProTabs, ProTabPane } from '@pro/tabs'

const activeTab = ref('tab1')
</script>

<template>
  <ProTabs v-model="activeTab">
    <ProTabPane label="用户管理" name="tab1">用户管理内容</ProTabPane>
    <ProTabPane label="角色管理" name="tab2">角色管理内容</ProTabPane>
    <ProTabPane label="权限配置" name="tab3">权限配置内容</ProTabPane>
  </ProTabs>
</template>
