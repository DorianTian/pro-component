<script setup lang="ts">
import { ref } from 'vue'
import { Select } from '@pro/select'
import { ElOption } from 'element-plus'

const value = ref('banana')

const options = [
  { label: '苹果', value: 'apple' },
  { label: '香蕉', value: 'banana' },
  { label: '樱桃（禁用）', value: 'cherry', disabled: true },
  { label: '葡萄', value: 'grape' },
  { label: '芒果（禁用）', value: 'mango', disabled: true },
]
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 380px">
    <div>
      <label
        style="
          display: block;
          margin-bottom: 8px;
          font-size: 13px;
          color: #737373;
          font-weight: 500;
        "
        >整体禁用</label
      >
      <Select v-model="value" disabled placeholder="请选择水果">
        <ElOption v-for="opt in options" :key="opt.value" :label="opt.label" :value="opt.value" />
      </Select>
    </div>
    <div>
      <label
        style="
          display: block;
          margin-bottom: 8px;
          font-size: 13px;
          color: #737373;
          font-weight: 500;
        "
        >部分选项禁用</label
      >
      <Select v-model="value" placeholder="请选择水果">
        <ElOption
          v-for="opt in options"
          :key="opt.value"
          :label="opt.label"
          :value="opt.value"
          :disabled="opt.disabled"
        />
      </Select>
    </div>
  </div>
</template>
