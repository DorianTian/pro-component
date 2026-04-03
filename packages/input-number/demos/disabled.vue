<script setup lang="ts">
import { ref } from 'vue'
import { InputNumber } from '@pro/input-number'

const value = ref(10)
</script>

<template>
  <div style="max-width: 380px">
    <label
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
      >禁用状态</label
    >
    <InputNumber v-model="value" disabled />
  </div>
</template>
