<script setup lang="ts">
import { ref } from 'vue'
import { Dialog } from '@pro/dialog'
import { ElButton } from 'element-plus'

const outerVisible = ref(false)
const innerVisible = ref(false)
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 480px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      嵌套对话框 — 在对话框中打开另一个对话框
    </span>
    <ElButton @click="outerVisible = true">打开外层对话框</ElButton>
    <Dialog v-model="outerVisible" title="外层对话框" width="520px">
      <p>这是外层对话框的内容。点击下方按钮可以打开内层对话框。</p>
      <ElButton type="primary" style="margin-top: 12px" @click="innerVisible = true">
        打开内层对话框
      </ElButton>
      <Dialog v-model="innerVisible" title="内层对话框" width="360px">
        <p>这是内层对话框，关闭后会回到外层。</p>
        <template #footer>
          <ElButton @click="innerVisible = false">关闭</ElButton>
        </template>
      </Dialog>
      <template #footer>
        <ElButton @click="outerVisible = false">关闭</ElButton>
      </template>
    </Dialog>
  </div>
</template>
