<script setup lang="ts">
import { ref } from 'vue'
import { Cascader } from '@pro/cascader'

const large = ref<string[]>([])
const normal = ref<string[]>([])
const small = ref<string[]>([])

const options = [
  {
    label: '广东省',
    value: 'guangdong',
    children: [
      {
        label: '深圳市',
        value: 'shenzhen',
        children: [{ label: '南山区', value: 'nanshan' }],
      },
    ],
  },
  {
    label: '浙江省',
    value: 'zhejiang',
    children: [
      {
        label: '杭州市',
        value: 'hangzhou',
        children: [{ label: '西湖区', value: 'xihu' }],
      },
    ],
  },
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
      <Cascader v-model="large" :options="options" size="large" placeholder="请选择" />
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
      <Cascader v-model="normal" :options="options" placeholder="请选择" />
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
      <Cascader v-model="small" :options="options" size="small" placeholder="请选择" />
    </div>
  </div>
</template>
