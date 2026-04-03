<script setup lang="ts">
import { ref } from 'vue'
import { DatePicker } from '@pro/date-picker'

const large = ref('')
const defaultSize = ref('')
const small = ref('')
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 400px">
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
      <DatePicker v-model="large" size="large" placeholder="大尺寸" />
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
      <DatePicker v-model="defaultSize" size="default" placeholder="默认尺寸" />
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
        >小尺寸</label
      >
      <DatePicker v-model="small" size="small" placeholder="小尺寸" />
    </div>
  </div>
</template>
