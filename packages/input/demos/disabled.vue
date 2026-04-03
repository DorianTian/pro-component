<script setup lang="ts">
import { ref } from 'vue'
import { Input } from '@pro/input'

const value = ref('不可编辑的内容')
</script>

<template>
  <div style="max-width: 380px">
    <label
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
      >禁用状态</label
    >
    <Input v-model="value" disabled placeholder="此输入框已禁用" />
  </div>
</template>
