<script setup lang="ts">
import { ref } from 'vue'
import { DatePicker } from '@pro/date-picker'

const date1 = ref('')
const date2 = ref('')
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
        >中文格式显示（YYYY 年 MM 月 DD 日）</label
      >
      <DatePicker v-model="date1" format="YYYY 年 MM 月 DD 日" placeholder="请选择日期" />
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
        >斜杠分隔（DD/MM/YYYY）</label
      >
      <DatePicker v-model="date2" format="DD/MM/YYYY" placeholder="请选择日期" />
    </div>
  </div>
</template>
