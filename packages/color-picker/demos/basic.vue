<script setup lang="ts">
import { ref } from 'vue'
import { ColorPicker } from '@pro/color-picker'

const basic = ref('#409EFF')
const withAlpha = ref('rgba(64, 158, 255, 0.7)')
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 600px">
    <div>
      <label
        style="
          display: block;
          margin-bottom: 8px;
          font-size: 13px;
          color: #737373;
          font-weight: 500;
        "
        >Basic</label
      >
      <div style="display: flex; align-items: center; gap: 12px">
        <ColorPicker v-model="basic" />
        <span style="font-size: 13px; color: #737373">{{ basic }}</span>
      </div>
    </div>
    <div>
      <label
        style="
          display: block;
          margin-bottom: 8px;
          font-size: 13px;
          color: #737373;
          font-weight: 500;
        "
        >With alpha</label
      >
      <div style="display: flex; align-items: center; gap: 12px">
        <ColorPicker v-model="withAlpha" show-alpha />
        <span style="font-size: 13px; color: #737373">{{ withAlpha }}</span>
      </div>
    </div>
  </div>
</template>
