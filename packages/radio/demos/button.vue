<script setup lang="ts">
import { ref } from 'vue'
import { RadioGroup, RadioButton } from '@pro/radio'

const selected = ref('北京')
</script>

<template>
  <div style="max-width: 480px">
    <label
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
      >按钮样式</label
    >
    <RadioGroup v-model="selected">
      <RadioButton value="北京">北京</RadioButton>
      <RadioButton value="上海">上海</RadioButton>
      <RadioButton value="广州">广州</RadioButton>
      <RadioButton value="深圳">深圳</RadioButton>
    </RadioGroup>
  </div>
</template>
