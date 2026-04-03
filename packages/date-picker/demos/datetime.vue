<script setup lang="ts">
import { ref } from 'vue'
import { DatePicker } from '@pro/date-picker'

const datetime = ref('')
</script>

<template>
  <div style="max-width: 400px">
    <label
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
      >日期时间选择</label
    >
    <DatePicker
      v-model="datetime"
      type="datetime"
      value-format="YYYY-MM-DD HH:mm:ss"
      placeholder="请选择日期和时间"
    />
    <p style="margin-top: 12px; font-size: 13px; color: #999">当前值：{{ datetime || '未选择' }}</p>
  </div>
</template>
