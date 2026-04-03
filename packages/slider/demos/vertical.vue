<script setup lang="ts">
import { ref } from 'vue'
import { Slider } from '@pro/slider'

const value = ref(40)
</script>

<template>
  <div>
    <label
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
      >垂直模式</label
    >
    <div style="height: 200px; padding: 0 24px">
      <Slider v-model="value" vertical height="200px" />
    </div>
  </div>
</template>
