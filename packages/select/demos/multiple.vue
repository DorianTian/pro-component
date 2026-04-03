<script setup lang="ts">
import { ref } from 'vue'
import { Select } from '@pro/select'
import { ElOption } from 'element-plus'

const value = ref<string[]>([])

const options = [
  { label: '苹果', value: 'apple' },
  { label: '香蕉', value: 'banana' },
  { label: '樱桃', value: 'cherry' },
  { label: '葡萄', value: 'grape' },
  { label: '芒果', value: 'mango' },
  { label: '橙子', value: 'orange' },
  { label: '西瓜', value: 'watermelon' },
]
</script>

<template>
  <div style="max-width: 380px">
    <label
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
      >多选模式（折叠标签）</label
    >
    <Select v-model="value" multiple collapse-tags collapse-tags-tooltip placeholder="请选择水果">
      <ElOption v-for="opt in options" :key="opt.value" :label="opt.label" :value="opt.value" />
    </Select>
  </div>
</template>
