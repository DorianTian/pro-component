<script setup lang="ts">
import { ref } from 'vue'
import { InputNumber } from '@pro/input-number'

const basic = ref(0)
const stepped = ref(0)
const ranged = ref(5)
const disabled = ref(10)
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
      <InputNumber v-model="basic" />
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
        >Step = 2</label
      >
      <InputNumber v-model="stepped" :step="2" />
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
        >Min / Max range (1 – 10)</label
      >
      <InputNumber v-model="ranged" :min="1" :max="10" />
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
        >Disabled</label
      >
      <InputNumber v-model="disabled" disabled />
    </div>
  </div>
</template>
