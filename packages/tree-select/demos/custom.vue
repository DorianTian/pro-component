<script setup lang="ts">
import { ref } from 'vue'
import { TreeSelect } from '@pro/tree-select'

const value = ref('')

const data = [
  {
    label: '研发中心',
    value: 'rd',
    headcount: 45,
    children: [
      {
        label: '前端组',
        value: 'fe',
        headcount: 20,
        children: [
          { label: 'Web 团队', value: 'web', headcount: 12 },
          { label: '移动端团队', value: 'mobile', headcount: 8 },
        ],
      },
      {
        label: '后端组',
        value: 'be',
        headcount: 25,
        children: [
          { label: 'API 团队', value: 'api', headcount: 15 },
          { label: '数据团队', value: 'data', headcount: 10 },
        ],
      },
    ],
  },
  {
    label: '产品中心',
    value: 'product',
    headcount: 12,
    children: [
      { label: '产品设计', value: 'pd', headcount: 7 },
      { label: 'UX 设计', value: 'ux', headcount: 5 },
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
    <TreeSelect v-model="value" :data="data" placeholder="请选择部门">
      <template #default="{ data: node }">
        <span>{{ node.label }}</span>
        <span style="margin-left: 6px; font-size: 12px; color: #a3a3a3">
          {{ node.headcount }}人
        </span>
      </template>
    </TreeSelect>
  </div>
</template>
