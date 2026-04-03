<script setup lang="ts">
import { ProTree } from '@pro/tree'

import type { ProTreeNodeData } from '@pro/tree'

const treeData: ProTreeNodeData[] = [
  {
    id: 1,
    label: '华南区域',
    children: [
      { id: 11, label: '深圳分公司' },
      { id: 12, label: '广州分公司' },
      { id: 13, label: '珠海分公司' },
    ],
  },
  {
    id: 2,
    label: '华东区域',
    children: [
      { id: 21, label: '上海分公司' },
      { id: 22, label: '杭州分公司' },
      { id: 23, label: '南京分公司' },
    ],
  },
  {
    id: 3,
    label: '华北区域',
    children: [
      { id: 31, label: '北京分公司' },
      { id: 32, label: '天津分公司' },
    ],
  },
]
</script>

<template>
  <div style="width: 320px">
    <ProTree
      :data="treeData"
      default-expand-all
      search-placeholder="搜索分公司..."
      highlight-current
    />
  </div>
</template>
