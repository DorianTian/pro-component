<script setup lang="ts">
import { ref } from 'vue'
import { Rate } from '@pro/rate'

const value = ref(3.5)
</script>

<template>
  <div style="max-width: 380px">
    <label
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
      >半星评分</label
    >
    <Rate v-model="value" allow-half />
    <p style="margin-top: 8px; font-size: 13px; color: #737373">当前评分：{{ value }}</p>
  </div>
</template>
