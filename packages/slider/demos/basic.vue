<script setup lang="ts">
import { ref } from 'vue'
import { Slider } from '@pro/slider'

const basic = ref(40)
const range = ref([20, 60])
const marks = ref(30)
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 24px; max-width: 600px">
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
      <Slider v-model="basic" />
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
        >Range</label
      >
      <Slider v-model="range" range />
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
        >With marks</label
      >
      <Slider v-model="marks" :marks="{ 0: '0%', 25: '25%', 50: '50%', 75: '75%', 100: '100%' }" />
    </div>
  </div>
</template>
