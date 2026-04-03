<script setup lang="ts">
import { ref } from 'vue'
import { Checkbox, CheckboxGroup } from '@pro/checkbox'

const selected = ref(['苹果', '橙子'])
</script>

<template>
  <div style="max-width: 480px">
    <label
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
      >最少选 1 项，最多选 3 项</label
    >
    <CheckboxGroup v-model="selected" :min="1" :max="3">
      <Checkbox value="苹果">苹果</Checkbox>
      <Checkbox value="香蕉">香蕉</Checkbox>
      <Checkbox value="橙子">橙子</Checkbox>
      <Checkbox value="葡萄">葡萄</Checkbox>
      <Checkbox value="芒果">芒果</Checkbox>
    </CheckboxGroup>
    <p style="margin-top: 12px; font-size: 13px; color: #737373">已选 {{ selected.length }} 项</p>
  </div>
</template>
