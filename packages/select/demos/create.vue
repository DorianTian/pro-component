<script setup lang="ts">
import { ref } from 'vue'
import { Select } from '@pro/select'
import { ElOption } from 'element-plus'

const value = ref('')
const options = ref([
  { label: 'React', value: 'react' },
  { label: 'Vue', value: 'vue' },
  { label: 'Angular', value: 'angular' },
  { label: 'Svelte', value: 'svelte' },
])
</script>

<template>
  <div style="max-width: 380px">
    <label
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
      >允许创建新条目</label
    >
    <Select v-model="value" allow-create default-first-option placeholder="选择或输入新框架">
      <ElOption v-for="opt in options" :key="opt.value" :label="opt.label" :value="opt.value" />
    </Select>
  </div>
</template>
