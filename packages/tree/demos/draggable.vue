<script setup lang="ts">
import { ref } from 'vue'
import { ProTree } from '@pro/tree'

import type { ProTreeNodeData, TreeDragEvent } from '@pro/tree'

const treeRef = ref<InstanceType<typeof ProTree> | null>(null)

const treeData = ref<ProTreeNodeData[]>([
  {
    id: 1,
    label: '项目文档',
    type: 'folder',
    children: [
      { id: 11, label: '需求文档', type: 'file' },
      { id: 12, label: '设计稿', type: 'file' },
      { id: 13, label: '技术方案', type: 'file' },
    ],
  },
  {
    id: 2,
    label: '会议纪要',
    type: 'folder',
    children: [
      { id: 21, label: '周会记录', type: 'file' },
      { id: 22, label: '评审记录', type: 'file' },
    ],
  },
  {
    id: 3,
    label: '归档文件',
    type: 'folder',
    children: [{ id: 31, label: '2024 年度报告', type: 'file' }],
  },
])

const lastEvent = ref<string>('')

/** Files cannot be drop targets for 'inner' (can't put things inside a file) */
function handleAllowDrop(
  _dragging: ProTreeNodeData,
  drop: ProTreeNodeData,
  type: 'before' | 'after' | 'inner',
): boolean {
  if (type === 'inner' && drop.type === 'file') return false
  return true
}

function handleDragEnd(event: TreeDragEvent): void {
  lastEvent.value = `Moved "${event.dragData.label}" ${event.position} "${event.dropData.label}"`
}
</script>

<template>
  <div style="width: 360px">
    <div style="display: flex; gap: 8px; margin-bottom: 12px">
      <el-button size="small" :disabled="!treeRef?.canUndo" @click="treeRef?.undo()">
        Undo
      </el-button>
      <el-button size="small" :disabled="!treeRef?.canRedo" @click="treeRef?.redo()">
        Redo
      </el-button>
    </div>

    <ProTree
      ref="treeRef"
      v-model:data="treeData"
      default-expand-all
      draggable
      :max-depth="3"
      :allow-drop="handleAllowDrop"
      :searchable="false"
      @drag-end="handleDragEnd"
    />

    <p v-if="lastEvent" style="margin: 12px 0 0; font-size: 13px; color: #737373">
      {{ lastEvent }}
    </p>
    <p style="margin: 8px 0 0; font-size: 12px; color: #a3a3a3">
      maxDepth=3 · files cannot have children · undo/redo supported
    </p>
  </div>
</template>
