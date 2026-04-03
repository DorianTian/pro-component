<script setup lang="ts">
import { Statistic } from '@pro/statistic'
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 480px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      基础数值展示
    </span>
    <div style="display: flex; gap: 48px">
      <Statistic title="活跃用户" :value="268500" />
      <Statistic title="日均访问" :value="93120" />
    </div>
  </div>
</template>
