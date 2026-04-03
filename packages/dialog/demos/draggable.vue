<script setup lang="ts">
import { ref } from 'vue'
import { Dialog } from '@pro/dialog'
import { ElButton } from 'element-plus'

const visible = ref(false)
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 480px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      可拖拽对话框 — Dialog 默认启用 draggable，拖动标题栏即可移动
    </span>
    <ElButton @click="visible = true">打开可拖拽对话框</ElButton>
    <Dialog v-model="visible" title="拖动标题栏试试" width="400px">
      <p>Pro Dialog 默认启用拖拽功能（draggable=true），无需额外配置。</p>
      <p style="color: #999; font-size: 13px; margin-top: 8px">
        按住标题栏拖动此对话框到任意位置。
      </p>
      <template #footer>
        <ElButton @click="visible = false">关闭</ElButton>
      </template>
    </Dialog>
  </div>
</template>
