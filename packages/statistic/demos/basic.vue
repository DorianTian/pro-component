<script setup lang="ts">
import { Statistic } from '@pro/statistic'
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 24px; max-width: 560px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      基础数值
    </span>
    <div style="display: flex; gap: 48px">
      <Statistic title="活跃用户" :value="268500" />
      <Statistic title="日均访问" :value="93120" />
    </div>

    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      带前缀 / 后缀
    </span>
    <div style="display: flex; gap: 48px">
      <Statistic title="账户余额" :value="12680.5" :precision="2">
        <template #prefix>¥</template>
      </Statistic>
      <Statistic title="增长率" :value="18.6" :precision="1">
        <template #suffix>%</template>
      </Statistic>
    </div>

    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      分组千分位
    </span>
    <div style="display: flex; gap: 48px">
      <Statistic title="总交易额" :value="1234567" group-separator="," :precision="0" />
    </div>
  </div>
</template>
