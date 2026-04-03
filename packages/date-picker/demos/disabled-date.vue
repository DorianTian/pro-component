<script setup lang="ts">
import { ref } from 'vue'
import { DatePicker } from '@pro/date-picker'

const date = ref('')

const disabledDate = (time: Date) => {
  return time.getTime() > Date.now()
}
</script>

<template>
  <div style="max-width: 400px">
    <label
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
      >禁用未来日期</label
    >
    <DatePicker
      v-model="date"
      :disabled-date="disabledDate"
      placeholder="只能选择今天及之前的日期"
    />
    <p style="margin-top: 12px; font-size: 13px; color: #999">当前值：{{ date || '未选择' }}</p>
  </div>
</template>
