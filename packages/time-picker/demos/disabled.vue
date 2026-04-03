<script setup lang="ts">
import { ref } from 'vue'
import { TimePicker } from '@pro/time-picker'

const time = ref(new Date(2026, 3, 3, 9, 30, 0))
</script>

<template>
  <div style="max-width: 400px">
    <label
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
      >禁用状态</label
    >
    <TimePicker v-model="time" disabled placeholder="请选择时间" />
  </div>
</template>
