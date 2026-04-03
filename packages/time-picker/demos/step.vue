<script setup lang="ts">
import { ref } from 'vue'
import { TimePicker } from '@pro/time-picker'

const time = ref('')
</script>

<template>
  <div style="max-width: 400px">
    <label
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
      >可选范围限制（09:00 - 18:30）</label
    >
    <TimePicker
      v-model="time"
      :selectable-range="'09:00:00 - 18:30:00'"
      placeholder="仅工作时间段可选"
    />
    <p style="margin-top: 12px; font-size: 13px; color: #999">
      限制只能选择 09:00 到 18:30 之间的时间
    </p>
  </div>
</template>
