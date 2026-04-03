<script setup lang="ts">
import { ref } from 'vue'
import { ColorPicker } from '@pro/color-picker'

const color = ref('rgba(64, 158, 255, 0.7)')
</script>

<template>
  <div style="max-width: 380px">
    <label
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
      >带透明度</label
    >
    <div style="display: flex; align-items: center; gap: 12px">
      <ColorPicker v-model="color" show-alpha />
      <span style="font-size: 13px; color: #737373">{{ color }}</span>
    </div>
  </div>
</template>
