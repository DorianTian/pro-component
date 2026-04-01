<script setup lang="ts">
import { ref } from 'vue'
import { ProTabs, ProTabPane } from '@pro/tabs'

const activeTab = ref('tab1')
const tabs = ref([
  { label: 'Tab 1', name: 'tab1' },
  { label: 'Tab 2', name: 'tab2' },
  { label: 'Tab 3', name: 'tab3' },
])

function handleRemove(name: string) {
  tabs.value = tabs.value.filter((t) => t.name !== name)
  if (activeTab.value === name) {
    activeTab.value = tabs.value[0]?.name ?? ''
  }
}
</script>

<template>
  <ProTabs v-model="activeTab" closable confirm-close @tab-remove="handleRemove">
    <ProTabPane v-for="tab in tabs" :key="tab.name" :label="tab.label" :name="tab.name">
      {{ tab.label }} 的内容
    </ProTabPane>
  </ProTabs>
</template>
