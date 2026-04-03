<script setup lang="ts">
import { ref } from 'vue'
import { InputNumber } from '@pro/input-number'

const age = ref(18)
const score = ref(60)
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
        >年龄（1 – 120）</label
      >
      <InputNumber v-model="age" :min="1" :max="120" />
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
        >考试成绩（0 – 100）</label
      >
      <InputNumber v-model="score" :min="0" :max="100" />
    </div>
  </div>
</template>
