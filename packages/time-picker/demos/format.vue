<script setup lang="ts">
import { ref } from 'vue'
import { TimePicker } from '@pro/time-picker'

const time1 = ref('')
const time2 = ref('')
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
        >时:分（HH:mm）</label
      >
      <TimePicker v-model="time1" format="HH:mm" placeholder="请选择时间" />
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
        >时:分:秒（HH:mm:ss）</label
      >
      <TimePicker v-model="time2" format="HH:mm:ss" placeholder="请选择时间" />
    </div>
  </div>
</template>
