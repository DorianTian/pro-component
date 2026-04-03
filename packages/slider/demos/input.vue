<script setup lang="ts">
import { ref } from 'vue'
import { Slider } from '@pro/slider'

const value = ref(36)
</script>

<template>
  <div style="max-width: 480px">
    <label
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
      >带输入框</label
    >
    <Slider v-model="value" show-input />
  </div>
</template>
