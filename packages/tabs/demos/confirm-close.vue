<script setup lang="ts">
import { ref } from 'vue'
import { ProTabs, ProTabPane } from '@pro/tabs'

const activeTab = ref('tab1')
const tabs = ref([
  { label: '编辑中的文档', name: 'tab1' },
  { label: '未保存的草稿', name: 'tab2' },
  { label: '审批单详情', name: 'tab3' },
])

function handleRemove(name: string) {
  tabs.value = tabs.value.filter((t) => t.name !== name)
  if (activeTab.value === name) {
    activeTab.value = tabs.value[0]?.name ?? ''
  }
}
</script>

<template>
  <div>
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      关闭前弹出确认框，防止误关未保存内容
    </span>
    <ProTabs
      v-model="activeTab"
      closable
      confirm-close
      confirm-title="确认关闭"
      confirm-message="标签页内容可能未保存，确定关闭吗？"
      @tab-remove="handleRemove"
    >
      <ProTabPane v-for="tab in tabs" :key="tab.name" :label="tab.label" :name="tab.name">
        {{ tab.label }} — 这里是正在编辑的内容
      </ProTabPane>
    </ProTabs>
  </div>
</template>
