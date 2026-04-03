<script setup lang="ts">
import { ref } from 'vue'
import { ProTree } from '@pro/tree'

import type { ProTreeNodeData } from '@pro/tree'

const checkedKeys = ref<number[]>([])

const treeData: ProTreeNodeData[] = [
  {
    id: 1,
    label: '系统管理',
    children: [
      { id: 11, label: '用户管理' },
      { id: 12, label: '角色管理' },
      { id: 13, label: '权限管理' },
    ],
  },
  {
    id: 2,
    label: '数据管理',
    children: [
      { id: 21, label: '数据源配置' },
      { id: 22, label: '数据同步' },
      { id: 23, label: '数据质量' },
    ],
  },
  {
    id: 3,
    label: '运维监控',
    children: [
      { id: 31, label: '服务监控' },
      { id: 32, label: '日志查询' },
    ],
  },
]

function handleCheck(_: unknown, { checkedKeys: keys }: { checkedKeys: number[] }) {
  checkedKeys.value = keys
}
</script>

<template>
  <div style="width: 320px">
    <p style="margin: 0 0 8px; font-size: 13px; color: #737373">
      已选：{{ checkedKeys.length }} 项
    </p>
    <ProTree :data="treeData" default-expand-all show-checkbox @check="handleCheck" />
  </div>
</template>
