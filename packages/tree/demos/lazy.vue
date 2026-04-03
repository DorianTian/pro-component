<script setup lang="ts">
import { ProTree } from '@pro/tree'

import type { ProTreeNodeData } from '@pro/tree'

const treeData: ProTreeNodeData[] = [
  { id: 1, label: '华南区域' },
  { id: 2, label: '华东区域' },
  { id: 3, label: '华北区域' },
]

interface TreeNode {
  data: ProTreeNodeData
  level: number
}

const childMap: Record<number, ProTreeNodeData[]> = {
  1: [
    { id: 11, label: '深圳', isLeaf: true },
    { id: 12, label: '广州', isLeaf: true },
  ],
  2: [
    { id: 21, label: '上海', isLeaf: true },
    { id: 22, label: '杭州', isLeaf: true },
    { id: 23, label: '南京', isLeaf: true },
  ],
  3: [
    { id: 31, label: '北京', isLeaf: true },
    { id: 32, label: '天津', isLeaf: true },
  ],
}

function loadChildren(node: TreeNode, resolve: (data: ProTreeNodeData[]) => void) {
  if (node.level === 0) {
    resolve(treeData)
    return
  }
  setTimeout(() => {
    const children = childMap[node.data.id as number] ?? []
    resolve(children)
  }, 800)
}
</script>

<template>
  <div style="width: 320px">
    <ProTree :data="[]" :searchable="false" lazy :load="loadChildren" highlight-current />
  </div>
</template>
