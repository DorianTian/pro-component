<script setup lang="ts">
import { ProTree } from '@pro/tree'

const treeData = [
  {
    id: 1,
    label: '数据域 A',
    children: [
      { id: 11, label: '业务过程 A-1' },
      { id: 12, label: '业务过程 A-2' },
      { id: 13, label: '业务过程 A-3' },
    ],
  },
  {
    id: 2,
    label: '数据域 B',
    children: [
      { id: 21, label: '业务过程 B-1' },
      { id: 22, label: '业务过程 B-2' },
    ],
  },
  {
    id: 3,
    label: '数据域 C',
    children: [{ id: 31, label: '业务过程 C-1' }],
  },
]
</script>

<template>
  <div style="width: 300px">
    <ProTree :data="treeData" default-expand-all highlight-current />
  </div>
</template>
