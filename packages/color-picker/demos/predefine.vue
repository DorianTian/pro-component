<script setup lang="ts">
import { ref } from 'vue'
import { ColorPicker } from '@pro/color-picker'

const color = ref('#409EFF')

const predefine = [
  '#ff4500',
  '#ff8c00',
  '#ffd700',
  '#90ee90',
  '#00ced1',
  '#1e90ff',
  '#c71585',
  '#409EFF',
  '#67C23A',
  '#E6A23C',
  '#F56C6C',
  '#909399',
]
</script>

<template>
  <div style="max-width: 380px">
    <label
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
      >预定义颜色</label
    >
    <div style="display: flex; align-items: center; gap: 12px">
      <ColorPicker v-model="color" :predefine="predefine" />
      <span style="font-size: 13px; color: #737373">{{ color }}</span>
    </div>
  </div>
</template>
