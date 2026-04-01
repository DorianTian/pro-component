<script setup lang="ts">
import { ref } from 'vue'
import { ProTabs, ProTabPane } from '@pro/tabs'

const activeTab = ref('tab1')
</script>

<template>
  <ProTabs v-model="activeTab" variant="card">
    <ProTabPane label="概览" name="tab1">概览内容</ProTabPane>
    <ProTabPane label="详情" name="tab2">详情内容</ProTabPane>
  </ProTabs>
</template>
