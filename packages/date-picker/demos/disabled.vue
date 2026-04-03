<script setup lang="ts">
import { ref } from 'vue'
import { DatePicker } from '@pro/date-picker'

const date = ref('2026-04-03')
</script>

<template>
  <div style="max-width: 400px">
    <label
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
      >禁用状态</label
    >
    <DatePicker v-model="date" disabled placeholder="请选择日期" />
  </div>
</template>
