<script setup lang="ts">
import { ref } from 'vue'
import { Input } from '@pro/input'

const amount = ref('')

const formatter = (value: string) => {
  if (!value) return ''
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const parser = (value: string) => {
  return value.replace(/,/g, '')
}
</script>

<template>
  <div style="max-width: 380px">
    <label
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
      >金额输入（千分位格式化）</label
    >
    <Input v-model="amount" :formatter="formatter" :parser="parser" placeholder="请输入金额" />
    <p style="margin-top: 8px; font-size: 13px; color: #a3a3a3">实际值：{{ amount || '—' }}</p>
  </div>
</template>
