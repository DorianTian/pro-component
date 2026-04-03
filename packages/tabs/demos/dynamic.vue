<script setup lang="ts">
import { ref } from 'vue'
import { ProTabs, ProTabPane } from '@pro/tabs'
import { ElButton } from 'element-plus'

let tabIndex = 3
const activeTab = ref('tab1')
const tabs = ref([
  { label: '标签一', name: 'tab1' },
  { label: '标签二', name: 'tab2' },
  { label: '标签三', name: 'tab3' },
])

function addTab() {
  tabIndex++
  const name = `tab${tabIndex}`
  tabs.value.push({ label: `标签${tabIndex}`, name })
  activeTab.value = name
}

function removeTab(name: string) {
  const idx = tabs.value.findIndex((t) => t.name === name)
  tabs.value.splice(idx, 1)
  if (activeTab.value === name) {
    activeTab.value = tabs.value[Math.min(idx, tabs.value.length - 1)]?.name ?? ''
  }
}
</script>

<template>
  <div>
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      动态增删标签页
    </span>
    <ElButton size="small" style="margin-bottom: 12px" @click="addTab">新增标签</ElButton>

    <ProTabs v-model="activeTab" closable @tab-remove="removeTab">
      <ProTabPane v-for="tab in tabs" :key="tab.name" :label="tab.label" :name="tab.name">
        {{ tab.label }} 的内容区域
      </ProTabPane>
    </ProTabs>
  </div>
</template>
