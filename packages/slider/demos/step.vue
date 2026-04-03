<script setup lang="ts">
import { ref } from 'vue'
import { Slider } from '@pro/slider'

const value = ref(40)
</script>

<template>
  <div style="max-width: 480px">
    <label
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
      >步长为 10，显示间断点</label
    >
    <Slider v-model="value" :step="10" show-stops />
  </div>
</template>
