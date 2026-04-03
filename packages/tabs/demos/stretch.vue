<script setup lang="ts">
import { ref } from 'vue'
import { ProTabs, ProTabPane } from '@pro/tabs'

const activeTab = ref('tab1')
</script>

<template>
  <div>
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      标签页自动拉伸填满容器宽度
    </span>
    <ProTabs v-model="activeTab" stretch>
      <ProTabPane label="全部订单" name="tab1">全部订单列表</ProTabPane>
      <ProTabPane label="待付款" name="tab2">待付款订单列表</ProTabPane>
      <ProTabPane label="待发货" name="tab3">待发货订单列表</ProTabPane>
      <ProTabPane label="已完成" name="tab4">已完成订单列表</ProTabPane>
    </ProTabs>
  </div>
</template>
