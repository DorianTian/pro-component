<script setup lang="ts">
import { ref } from 'vue'
import { Select } from '@pro/select'
import { ElOption } from 'element-plus'

const large = ref('')
const normal = ref('')
const small = ref('')

const options = [
  { label: '苹果', value: 'apple' },
  { label: '香蕉', value: 'banana' },
  { label: '樱桃', value: 'cherry' },
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
        >大号 (large)</label
      >
      <Select v-model="large" size="large" placeholder="请选择">
        <ElOption v-for="o in options" :key="o.value" :label="o.label" :value="o.value" />
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
        >默认 (default)</label
      >
      <Select v-model="normal" placeholder="请选择">
        <ElOption v-for="o in options" :key="o.value" :label="o.label" :value="o.value" />
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
        >小号 (small)</label
      >
      <Select v-model="small" size="small" placeholder="请选择">
        <ElOption v-for="o in options" :key="o.value" :label="o.label" :value="o.value" />
      </Select>
    </div>
  </div>
</template>
