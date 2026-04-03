<script setup lang="ts">
import { ref } from 'vue'
import { Radio, RadioGroup } from '@pro/radio'

const selected = ref('苹果')
</script>

<template>
  <div style="max-width: 480px">
    <label
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
      >带边框样式</label
    >
    <RadioGroup v-model="selected">
      <Radio value="苹果" border>苹果</Radio>
      <Radio value="香蕉" border>香蕉</Radio>
      <Radio value="橙子" border>橙子</Radio>
    </RadioGroup>
  </div>
</template>
