<script setup lang="ts">
import { ref } from 'vue'
import { Cascader } from '@pro/cascader'

const value = ref<string[]>([])

const options = [
  {
    label: '广东省',
    value: 'guangdong',
    count: 21,
    children: [
      {
        label: '深圳市',
        value: 'shenzhen',
        count: 10,
        children: [
          { label: '南山区', value: 'nanshan', count: 3 },
          { label: '福田区', value: 'futian', count: 4 },
          { label: '罗湖区', value: 'luohu', count: 3 },
        ],
      },
      {
        label: '广州市',
        value: 'guangzhou',
        count: 11,
        children: [
          { label: '天河区', value: 'tianhe', count: 6 },
          { label: '越秀区', value: 'yuexiu', count: 5 },
        ],
      },
    ],
  },
  {
    label: '浙江省',
    value: 'zhejiang',
    count: 8,
    children: [
      {
        label: '杭州市',
        value: 'hangzhou',
        count: 8,
        children: [
          { label: '西湖区', value: 'xihu', count: 5 },
          { label: '余杭区', value: 'yuhang', count: 3 },
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
      >自定义节点内容</label
    >
    <Cascader v-model="value" :options="options" placeholder="请选择地区">
      <template #default="{ node, data }">
        <span>{{ data.label }}</span>
        <span v-if="!node.isLeaf" style="margin-left: 4px; color: #a3a3a3; font-size: 12px">
          ({{ data.count }})
        </span>
      </template>
    </Cascader>
  </div>
</template>
