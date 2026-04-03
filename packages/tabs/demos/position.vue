<script setup lang="ts">
import { ref } from 'vue'
import { ProTabs, ProTabPane } from '@pro/tabs'

const activeTab = ref('tab1')
const position = ref<'top' | 'right' | 'bottom' | 'left'>('top')

const positions: Array<'top' | 'right' | 'bottom' | 'left'> = ['top', 'right', 'bottom', 'left']
</script>

<template>
  <div>
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      切换标签页位置：上 / 右 / 下 / 左
    </span>
    <div style="margin-bottom: 16px; display: flex; gap: 8px">
      <label
        v-for="pos in positions"
        :key="pos"
        style="font-size: 13px; color: #525252; cursor: pointer"
      >
        <input v-model="position" type="radio" :value="pos" style="margin-right: 4px" />
        {{ pos }}
      </label>
    </div>

    <ProTabs v-model="activeTab" :tab-position="position" style="min-height: 160px">
      <ProTabPane label="用户列表" name="tab1">用户管理表格区域</ProTabPane>
      <ProTabPane label="角色列表" name="tab2">角色配置表格区域</ProTabPane>
      <ProTabPane label="操作日志" name="tab3">最近操作记录</ProTabPane>
    </ProTabs>
  </div>
</template>
