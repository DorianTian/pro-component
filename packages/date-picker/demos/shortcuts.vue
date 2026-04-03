<script setup lang="ts">
import { ref } from 'vue'
import { DatePicker } from '@pro/date-picker'

const date = ref('')

const shortcuts = [
  {
    text: '今天',
    value: new Date(),
  },
  {
    text: '昨天',
    value: () => {
      const d = new Date()
      d.setDate(d.getDate() - 1)
      return d
    },
  },
  {
    text: '一周前',
    value: () => {
      const d = new Date()
      d.setDate(d.getDate() - 7)
      return d
    },
  },
  {
    text: '一个月前',
    value: () => {
      const d = new Date()
      d.setMonth(d.getMonth() - 1)
      return d
    },
  },
]
</script>

<template>
  <div style="max-width: 400px">
    <label
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
      >快捷选项</label
    >
    <DatePicker v-model="date" :shortcuts="shortcuts" placeholder="请选择日期" />
  </div>
</template>
