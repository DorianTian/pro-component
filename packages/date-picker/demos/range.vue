<script setup lang="ts">
import { ref } from 'vue'
import { DatePicker } from '@pro/date-picker'

const dateRange = ref<[string, string]>(['', ''])
</script>

<template>
  <div style="max-width: 500px">
    <label
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
      >日期范围</label
    >
    <DatePicker
      v-model="dateRange"
      type="daterange"
      range-separator="至"
      start-placeholder="开始日期"
      end-placeholder="结束日期"
    />
    <p style="margin-top: 12px; font-size: 13px; color: #999">
      范围：{{ dateRange[0] || '未选择' }} 至 {{ dateRange[1] || '未选择' }}
    </p>
  </div>
</template>
