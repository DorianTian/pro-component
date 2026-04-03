<script setup lang="ts">
import { ref } from 'vue'
import { DatePicker } from '@pro/date-picker'

const month = ref('')
const year = ref('')
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
        >月份选择</label
      >
      <DatePicker v-model="month" type="month" value-format="YYYY-MM" placeholder="请选择月份" />
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
        >年份选择</label
      >
      <DatePicker v-model="year" type="year" value-format="YYYY" placeholder="请选择年份" />
    </div>
  </div>
</template>
