<script setup lang="ts">
import { ref } from 'vue'
import { Checkbox } from '@pro/checkbox'

const a = ref(true)
const b = ref(false)
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; max-width: 380px">
    <label
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
      >禁用状态</label
    >
    <Checkbox v-model="a" disabled>选中且禁用</Checkbox>
    <Checkbox v-model="b" disabled>未选中且禁用</Checkbox>
  </div>
</template>
