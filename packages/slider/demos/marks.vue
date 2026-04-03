<script setup lang="ts">
import { ref } from 'vue'
import { Slider } from '@pro/slider'

const value = ref(30)

const marks = {
  0: '0°C',
  20: '20°C',
  37: '体温',
  50: '50°C',
  100: '沸点',
}
</script>

<template>
  <div style="max-width: 480px; padding-bottom: 24px">
    <label
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
      >带标记点</label
    >
    <Slider v-model="value" :marks="marks" />
  </div>
</template>
