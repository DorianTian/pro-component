<script setup lang="ts">
import { ref } from 'vue'
import { TimePicker } from '@pro/time-picker'

const time = ref('')
const timeRange = ref<[Date, Date] | ''>('')
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
      <TimePicker v-model="time" placeholder="Pick a time" />
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
        >Time range</label
      >
      <TimePicker
        v-model="timeRange"
        is-range
        start-placeholder="Start time"
        end-placeholder="End time"
      />
    </div>
  </div>
</template>
