<script setup lang="ts">
import { ref } from 'vue'
import { CheckboxGroup, CheckboxButton } from '@pro/checkbox'

const selected = ref(['北京'])
</script>

<template>
  <div style="max-width: 480px">
    <label
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
      >按钮样式</label
    >
    <CheckboxGroup v-model="selected">
      <CheckboxButton value="北京">北京</CheckboxButton>
      <CheckboxButton value="上海">上海</CheckboxButton>
      <CheckboxButton value="广州">广州</CheckboxButton>
      <CheckboxButton value="深圳">深圳</CheckboxButton>
    </CheckboxGroup>
  </div>
</template>
