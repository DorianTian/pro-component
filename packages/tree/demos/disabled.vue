<script setup lang="ts">
import { ProTree } from '@pro/tree'

import type { ProTreeNodeData } from '@pro/tree'

const treeData: ProTreeNodeData[] = [
  {
    id: 1,
    label: '可用功能',
    children: [
      { id: 11, label: '数据查询' },
      { id: 12, label: '报表导出' },
      { id: 13, label: '仪表盘' },
    ],
  },
  {
    id: 2,
    label: '受限功能（需升级）',
    disabled: true,
    children: [
      { id: 21, label: '高级分析', disabled: true },
      { id: 22, label: 'AI 助手', disabled: true },
      { id: 23, label: '自定义 ETL', disabled: true },
    ],
  },
  {
    id: 3,
    label: '管理功能',
    children: [
      { id: 31, label: '用户管理' },
      { id: 32, label: '审计日志', disabled: true },
    ],
  },
]
</script>

<template>
  <div style="width: 320px">
    <ProTree
      :data="treeData"
      default-expand-all
      show-checkbox
      :searchable="false"
      highlight-current
    />
  </div>
</template>
