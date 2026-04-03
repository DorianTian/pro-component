<script setup lang="ts">
import { ref } from 'vue'
import { ProTree } from '@pro/tree'
import { ElButton } from 'element-plus'

import type { ProTreeNodeData } from '@pro/tree'

const treeRef = ref<InstanceType<typeof ProTree> | null>(null)

const treeData: ProTreeNodeData[] = [
  {
    id: 1,
    label: '一级目录 A',
    children: [
      {
        id: 11,
        label: '二级目录 A-1',
        children: [
          { id: 111, label: '文件 A-1-1' },
          { id: 112, label: '文件 A-1-2' },
        ],
      },
      { id: 12, label: '文件 A-2' },
    ],
  },
  {
    id: 2,
    label: '一级目录 B',
    children: [
      { id: 21, label: '文件 B-1' },
      { id: 22, label: '文件 B-2' },
      { id: 23, label: '文件 B-3' },
    ],
  },
]
</script>

<template>
  <div style="width: 320px">
    <div style="display: flex; gap: 8px; margin-bottom: 12px">
      <ElButton size="small" @click="treeRef?.expandAll()">全部展开</ElButton>
      <ElButton size="small" @click="treeRef?.collapseAll()">全部收起</ElButton>
    </div>
    <ProTree ref="treeRef" :data="treeData" highlight-current />
  </div>
</template>
