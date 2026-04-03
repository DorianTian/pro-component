<script setup lang="ts">
import { ref } from 'vue'
import { Rate } from '@pro/rate'

const value = ref(3.7)
</script>

<template>
  <div style="max-width: 380px">
    <label
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
      >只读评分</label
    >
    <Rate v-model="value" disabled allow-half show-score />
  </div>
</template>
