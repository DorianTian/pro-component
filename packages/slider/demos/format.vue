<script setup lang="ts">
import { ref } from 'vue'
import { Slider } from '@pro/slider'

const value = ref(50)

function formatTooltip(val: number): string {
  return `${val}%`
}
</script>

<template>
  <div style="max-width: 480px">
    <label
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
      >自定义提示格式</label
    >
    <Slider v-model="value" :format-tooltip="formatTooltip" />
  </div>
</template>
