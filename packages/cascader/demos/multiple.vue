<script setup lang="ts">
import { ref } from 'vue'
import { Cascader } from '@pro/cascader'

const value = ref<string[][]>([])

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
          { label: '罗湖区', value: 'luohu' },
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
    label: '浙江省',
    value: 'zhejiang',
    children: [
      {
        label: '杭州市',
        value: 'hangzhou',
        children: [
          { label: '西湖区', value: 'xihu' },
          { label: '余杭区', value: 'yuhang' },
        ],
      },
    ],
  },
]
</script>

<template>
  <div style="max-width: 380px">
    <label
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
      >多选模式</label
    >
    <Cascader
      v-model="value"
      :options="options"
      :props="{ multiple: true }"
      collapse-tags
      collapse-tags-tooltip
      placeholder="请选择地区"
    />
  </div>
</template>
