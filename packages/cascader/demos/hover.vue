<script setup lang="ts">
import { ref } from 'vue'
import { Cascader } from '@pro/cascader'

const value = ref<string[]>([])

const options = [
  {
    label: '广东省',
    value: 'guangdong',
    children: [
      {
        label: '深圳市',
        value: 'shenzhen',
        children: [
          { label: '南山区', value: 'nanshan' },
          { label: '福田区', value: 'futian' },
        ],
      },
      {
        label: '广州市',
        value: 'guangzhou',
        children: [
          { label: '天河区', value: 'tianhe' },
          { label: '越秀区', value: 'yuexiu' },
        ],
      },
    ],
  },
  {
    label: '北京市',
    value: 'beijing',
    children: [
      { label: '朝阳区', value: 'chaoyang' },
      { label: '海淀区', value: 'haidian' },
      { label: '东城区', value: 'dongcheng' },
    ],
  },
]
</script>

<template>
  <div style="max-width: 380px">
    <label
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
      >悬停展开子级</label
    >
    <Cascader
      v-model="value"
      :options="options"
      :props="{ expandTrigger: 'hover' }"
      placeholder="鼠标悬停展开"
    />
  </div>
</template>
