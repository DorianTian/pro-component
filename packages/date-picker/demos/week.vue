<script setup lang="ts">
import { ref } from 'vue'
import { DatePicker } from '@pro/date-picker'

const week = ref('')
</script>

<template>
  <div style="max-width: 400px">
    <label
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
      >周选择</label
    >
    <DatePicker v-model="week" type="week" placeholder="请选择周" />
    <p style="margin-top: 12px; font-size: 13px; color: #999">当前值：{{ week || '未选择' }}</p>
  </div>
</template>
