<script setup lang="ts">
import { ref } from 'vue'
import { TimePicker } from '@pro/time-picker'

const time = ref('')
</script>

<template>
  <div style="max-width: 400px">
    <label
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
      >箭头控制</label
    >
    <TimePicker v-model="time" arrow-control placeholder="使用箭头切换时间" />
    <p style="margin-top: 12px; font-size: 13px; color: #999">使用上下箭头替代滚动选择时间</p>
  </div>
</template>
