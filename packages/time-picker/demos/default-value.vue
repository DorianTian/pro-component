<script setup lang="ts">
import { ref } from 'vue'
import { TimePicker } from '@pro/time-picker'

const time = ref(new Date(2026, 3, 3, 14, 30, 0))
</script>

<template>
  <div style="max-width: 400px">
    <label
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
      >带默认值</label
    >
    <TimePicker v-model="time" placeholder="请选择时间" />
    <p style="margin-top: 12px; font-size: 13px; color: #999">默认值为 14:30:00</p>
  </div>
</template>
