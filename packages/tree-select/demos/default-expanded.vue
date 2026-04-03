<script setup lang="ts">
import { ref } from 'vue'
import { TreeSelect } from '@pro/tree-select'

const value = ref('')

const data = [
  {
    label: '研发中心',
    value: 'rd',
    children: [
      {
        label: '前端组',
        value: 'fe',
        children: [
          { label: 'Web 团队', value: 'web' },
          { label: '移动端团队', value: 'mobile' },
        ],
      },
      {
        label: '后端组',
        value: 'be',
        children: [
          { label: 'API 团队', value: 'api' },
          { label: '数据团队', value: 'data' },
        ],
      },
    ],
  },
  {
    label: '产品中心',
    value: 'product',
    children: [
      { label: '产品设计', value: 'pd' },
      { label: 'UX 设计', value: 'ux' },
    ],
  },
]
</script>

<template>
  <div style="max-width: 380px">
    <label
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
      >默认展开指定节点</label
    >
    <TreeSelect
      v-model="value"
      :data="data"
      :default-expanded-keys="['rd', 'fe']"
      placeholder="研发中心 → 前端组 已展开"
    />
  </div>
</template>
