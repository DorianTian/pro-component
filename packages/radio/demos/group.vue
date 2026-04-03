<script setup lang="ts">
import { ref } from 'vue'
import { Radio, RadioGroup } from '@pro/radio'

const selected = ref('苹果')
</script>

<template>
  <div style="max-width: 480px">
    <label
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
      >单选框组</label
    >
    <RadioGroup v-model="selected">
      <Radio value="苹果">苹果</Radio>
      <Radio value="香蕉">香蕉</Radio>
      <Radio value="橙子">橙子</Radio>
      <Radio value="葡萄">葡萄</Radio>
    </RadioGroup>
    <p style="margin-top: 12px; font-size: 13px; color: #737373">已选：{{ selected }}</p>
  </div>
</template>
