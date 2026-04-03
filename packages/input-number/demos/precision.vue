<script setup lang="ts">
import { ref } from 'vue'
import { InputNumber } from '@pro/input-number'

const price = ref(9.99)
</script>

<template>
  <div style="max-width: 380px">
    <label
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
      >商品价格（精确到 2 位小数）</label
    >
    <InputNumber v-model="price" :precision="2" :step="0.1" :min="0" />
    <p style="margin-top: 8px; font-size: 13px; color: #a3a3a3">当前价格：¥{{ price }}</p>
  </div>
</template>
