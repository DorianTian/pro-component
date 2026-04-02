<script setup lang="ts">
import { ref } from 'vue'
import { Dialog } from '@pro/dialog'
import { ElButton } from 'element-plus'

const basicVisible = ref(false)
const draggableVisible = ref(false)
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 480px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      基础对话框
    </span>
    <ElButton @click="basicVisible = true">打开对话框</ElButton>
    <Dialog v-model="basicVisible" title="基础对话框" width="420px">
      <p>这是一段对话框内容，用于展示基础用法。</p>
      <template #footer>
        <ElButton @click="basicVisible = false">取消</ElButton>
        <ElButton type="primary" @click="basicVisible = false">确定</ElButton>
      </template>
    </Dialog>

    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      可拖拽对话框（默认启用）
    </span>
    <ElButton @click="draggableVisible = true">打开可拖拽对话框</ElButton>
    <Dialog v-model="draggableVisible" title="拖拽试试" width="420px" draggable>
      <p>拖动标题栏可以移动此对话框。</p>
      <template #footer>
        <ElButton @click="draggableVisible = false">关闭</ElButton>
      </template>
    </Dialog>
  </div>
</template>
