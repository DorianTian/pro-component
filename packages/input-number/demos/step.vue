<script setup lang="ts">
import { ref } from 'vue'
import { InputNumber } from '@pro/input-number'

const step2 = ref(0)
const step5 = ref(0)
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
        >步长为 2</label
      >
      <InputNumber v-model="step2" :step="2" />
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
        >步长为 5</label
      >
      <InputNumber v-model="step5" :step="5" />
    </div>
  </div>
</template>
