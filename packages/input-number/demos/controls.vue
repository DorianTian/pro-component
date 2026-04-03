<script setup lang="ts">
import { ref } from 'vue'
import { InputNumber } from '@pro/input-number'

const rightPos = ref(0)
const defaultPos = ref(0)
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
        >右侧控制按钮（默认）</label
      >
      <InputNumber v-model="rightPos" />
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
        >两侧控制按钮</label
      >
      <InputNumber v-model="defaultPos" controls-position="" />
    </div>
  </div>
</template>
