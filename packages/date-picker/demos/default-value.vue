<script setup lang="ts">
import { ref } from 'vue'
import { DatePicker } from '@pro/date-picker'

const date = ref('2026-01-15')
</script>

<template>
  <div style="max-width: 400px">
    <label
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
      >带默认值</label
    >
    <DatePicker v-model="date" placeholder="请选择日期" />
    <p style="margin-top: 12px; font-size: 13px; color: #999">
      默认值为 2026-01-15，当前值：{{ date }}
    </p>
  </div>
</template>
