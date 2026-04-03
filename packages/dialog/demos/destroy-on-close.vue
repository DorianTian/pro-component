<script setup lang="ts">
import { ref } from 'vue'
import { Dialog } from '@pro/dialog'
import { ElButton, ElInput } from 'element-plus'

const visible = ref(false)
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 480px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      关闭时销毁 — 每次打开对话框内容都会重新初始化
    </span>
    <ElButton @click="visible = true">打开对话框</ElButton>
    <Dialog v-model="visible" title="关闭时销毁内容" width="420px" destroy-on-close>
      <p style="color: #999; font-size: 13px; margin-bottom: 12px">
        在下方输入内容后关闭对话框，再次打开会发现输入内容已清空。
      </p>
      <ElInput placeholder="输入一些内容，关闭后再打开试试" />
      <template #footer>
        <ElButton @click="visible = false">关闭</ElButton>
      </template>
    </Dialog>
  </div>
</template>
