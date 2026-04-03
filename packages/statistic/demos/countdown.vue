<script setup lang="ts">
import { ElCountdown } from 'element-plus'

const deadline = Date.now() + 1000 * 60 * 60 * 24 * 2
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 480px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      倒计时（使用 Element Plus ElCountdown）
    </span>
    <div style="display: flex; gap: 48px">
      <ElCountdown title="活动剩余时间" :value="deadline" />
      <ElCountdown title="自定义格式" :value="deadline" format="DD 天 HH 时 mm 分 ss 秒" />
    </div>
  </div>
</template>
