<script setup lang="ts">
import { Statistic } from '@pro/statistic'
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 480px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      精度控制和千分位分隔符
    </span>
    <div style="display: flex; gap: 48px">
      <Statistic title="成交金额" :value="1234567.89" :precision="2" group-separator="," />
      <Statistic title="转化率" :value="0.6834" :precision="4" />
      <Statistic title="整数展示" :value="8192" :precision="0" group-separator="," />
    </div>
  </div>
</template>
