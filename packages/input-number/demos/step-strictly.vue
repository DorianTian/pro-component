<script setup lang="ts">
import { ref } from 'vue'
import { InputNumber } from '@pro/input-number'

const value = ref(0)
</script>

<template>
  <div style="max-width: 380px">
    <label
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
      >严格步进（步长为 3）</label
    >
    <InputNumber v-model="value" :step="3" step-strictly />
    <p style="margin-top: 8px; font-size: 13px; color: #a3a3a3">只能输入 3 的倍数：{{ value }}</p>
  </div>
</template>
