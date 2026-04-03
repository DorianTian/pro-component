<script setup lang="ts">
import { ref } from 'vue'
import { Dialog } from '@pro/dialog'
import { ElButton } from 'element-plus'

const smallVisible = ref(false)
const mediumVisible = ref(false)
const largeVisible = ref(false)
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 480px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      不同宽度的对话框 — 30% / 50% / 70%
    </span>
    <div style="display: flex; gap: 8px">
      <ElButton size="small" @click="smallVisible = true">小型 (30%)</ElButton>
      <ElButton size="small" @click="mediumVisible = true">中型 (50%)</ElButton>
      <ElButton size="small" @click="largeVisible = true">大型 (70%)</ElButton>
    </div>

    <Dialog v-model="smallVisible" title="小型对话框" width="30%">
      <p>宽度为视口的 30%，适合简单确认或提示。</p>
      <template #footer>
        <ElButton @click="smallVisible = false">关闭</ElButton>
      </template>
    </Dialog>

    <Dialog v-model="mediumVisible" title="中型对话框" width="50%">
      <p>宽度为视口的 50%，适合表单填写或信息展示。</p>
      <template #footer>
        <ElButton @click="mediumVisible = false">关闭</ElButton>
      </template>
    </Dialog>

    <Dialog v-model="largeVisible" title="大型对话框" width="70%">
      <p>宽度为视口的 70%，适合复杂内容展示或数据表格。</p>
      <template #footer>
        <ElButton @click="largeVisible = false">关闭</ElButton>
      </template>
    </Dialog>
  </div>
</template>
