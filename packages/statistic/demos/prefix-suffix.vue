<script setup lang="ts">
import { Statistic } from '@pro/statistic'
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 480px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      前缀和后缀，展示单位或图标
    </span>
    <div style="display: flex; gap: 48px">
      <Statistic title="账户余额" :value="12680.5" :precision="2">
        <template #prefix>¥</template>
      </Statistic>
      <Statistic title="增长率" :value="18.6" :precision="1">
        <template #suffix>%</template>
      </Statistic>
      <Statistic title="响应时间" :value="42" :precision="0">
        <template #suffix>ms</template>
      </Statistic>
    </div>
  </div>
</template>
