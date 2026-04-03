<script setup lang="ts">
import { ref } from 'vue'
import { Slider } from '@pro/slider'

const value = ref([20, 60])
</script>

<template>
  <div style="max-width: 480px">
    <label
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
      >范围选择</label
    >
    <Slider v-model="value" range />
    <p style="margin-top: 12px; font-size: 13px; color: #737373">
      范围：{{ value[0] }} - {{ value[1] }}
    </p>
  </div>
</template>
