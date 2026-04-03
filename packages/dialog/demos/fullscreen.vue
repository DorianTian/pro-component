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
      全屏对话框 — 设置 fullscreen 属性
    </span>
    <ElButton @click="visible = true">打开全屏对话框</ElButton>
    <Dialog v-model="visible" title="数据报表预览" fullscreen>
      <div style="padding: 20px; color: #666">
        <p style="font-size: 15px; margin-bottom: 12px">
          全屏模式适合展示大量内容，如报表、代码编辑器等。
        </p>
        <div
          style="
            background: #f5f5f5;
            border-radius: 8px;
            padding: 40px;
            text-align: center;
            color: #999;
          "
        >
          报表内容区域
        </div>
      </div>
      <template #footer>
        <ElButton @click="visible = false">关闭</ElButton>
      </template>
    </Dialog>
  </div>
</template>
