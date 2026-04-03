<script setup lang="ts">
import { ref } from 'vue'
import { TimePicker } from '@pro/time-picker'

const timeRange = ref<[Date, Date] | ''>('')
</script>

<template>
  <div style="max-width: 500px">
    <label
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
      >时间范围</label
    >
    <TimePicker
      v-model="timeRange"
      is-range
      range-separator="至"
      start-placeholder="开始时间"
      end-placeholder="结束时间"
    />
  </div>
</template>
