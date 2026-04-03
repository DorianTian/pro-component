<script setup lang="ts">
import { Statistic } from '@pro/statistic'
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 640px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      卡片式统计数值，适合仪表盘场景
    </span>
    <div style="display: flex; gap: 16px; flex-wrap: wrap">
      <div
        v-for="item in [
          { title: '总用户数', value: 18620 },
          { title: '月活跃', value: 6890 },
          { title: '总收入', value: 126800 },
          { title: '待处理工单', value: 42 },
        ]"
        :key="item.title"
        style="
          flex: 1;
          min-width: 120px;
          padding: 16px 20px;
          background: #fafafa;
          border: 1px solid #f0f0f0;
          border-radius: 8px;
        "
      >
        <Statistic :title="item.title" :value="item.value" />
      </div>
    </div>
  </div>
</template>
