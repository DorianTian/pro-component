<script setup lang="ts">
import { ref } from 'vue'
import { InputNumber } from '@pro/input-number'

const small = ref(0)
const medium = ref(0)
const large = ref(0)
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 380px">
    <div>
      <label
        style="
          display: block;
          margin-bottom: 8px;
          font-size: 13px;
          color: #737373;
          font-weight: 500;
        "
        >小尺寸 small</label
      >
      <InputNumber v-model="small" size="small" />
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
        >默认尺寸 default</label
      >
      <InputNumber v-model="medium" />
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
        >大尺寸 large</label
      >
      <InputNumber v-model="large" size="large" />
    </div>
  </div>
</template>
