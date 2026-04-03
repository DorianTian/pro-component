<script setup lang="ts">
import { ref } from 'vue'
import { Checkbox, CheckboxGroup } from '@pro/checkbox'

const selected = ref(['苹果'])
</script>

<template>
  <div style="max-width: 480px">
    <label
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
      >带边框样式</label
    >
    <CheckboxGroup v-model="selected">
      <Checkbox value="苹果" border>苹果</Checkbox>
      <Checkbox value="香蕉" border>香蕉</Checkbox>
      <Checkbox value="橙子" border>橙子</Checkbox>
    </CheckboxGroup>
  </div>
</template>
