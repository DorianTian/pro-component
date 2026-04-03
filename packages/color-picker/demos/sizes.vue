<script setup lang="ts">
import { ref } from 'vue'
import { ColorPicker } from '@pro/color-picker'

const small = ref('#409EFF')
const defaultSize = ref('#67C23A')
const large = ref('#E6A23C')
</script>

<template>
  <div style="display: flex; align-items: center; gap: 24px; max-width: 480px">
    <div>
      <label
        style="
          display: block;
          margin-bottom: 8px;
          font-size: 13px;
          color: #737373;
          font-weight: 500;
        "
        >小尺寸</label
      >
      <ColorPicker v-model="small" size="small" />
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
        >默认尺寸</label
      >
      <ColorPicker v-model="defaultSize" />
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
        >大尺寸</label
      >
      <ColorPicker v-model="large" size="large" />
    </div>
  </div>
</template>
