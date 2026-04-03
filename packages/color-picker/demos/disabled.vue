<script setup lang="ts">
import { ref } from 'vue'
import { ColorPicker } from '@pro/color-picker'

const color = ref('#409EFF')
</script>

<template>
  <div style="max-width: 380px">
    <label
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
      >禁用状态</label
    >
    <ColorPicker v-model="color" disabled />
  </div>
</template>
