<script setup lang="ts">
import { ref } from 'vue'
import { ColorPicker } from '@pro/color-picker'

const hex = ref('#409EFF')
const rgb = ref('rgb(64, 158, 255)')
const hsl = ref('hsl(210, 100%, 63%)')
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 20px; max-width: 380px">
    <div>
      <label
        style="
          display: block;
          margin-bottom: 8px;
          font-size: 13px;
          color: #737373;
          font-weight: 500;
        "
        >HEX 格式</label
      >
      <div style="display: flex; align-items: center; gap: 12px">
        <ColorPicker v-model="hex" color-format="hex" />
        <span style="font-size: 13px; color: #737373">{{ hex }}</span>
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
        >RGB 格式</label
      >
      <div style="display: flex; align-items: center; gap: 12px">
        <ColorPicker v-model="rgb" color-format="rgb" />
        <span style="font-size: 13px; color: #737373">{{ rgb }}</span>
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
        >HSL 格式</label
      >
      <div style="display: flex; align-items: center; gap: 12px">
        <ColorPicker v-model="hsl" color-format="hsl" />
        <span style="font-size: 13px; color: #737373">{{ hsl }}</span>
      </div>
    </div>
  </div>
</template>
