<script setup lang="ts">
import { ref } from 'vue'
import { Radio } from '@pro/radio'

const selected = ref('1')
</script>

<template>
  <div style="max-width: 380px">
    <label
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
      >禁用状态</label
    >
    <div style="display: flex; gap: 16px">
      <Radio v-model="selected" value="1" disabled>选中且禁用</Radio>
      <Radio v-model="selected" value="2" disabled>未选中且禁用</Radio>
    </div>
  </div>
</template>
