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
      居中对话框 — 标题和底部操作区居中显示
    </span>
    <ElButton @click="visible = true">居中对话框</ElButton>
    <Dialog v-model="visible" title="操作确认" width="380px" center align-center>
      <div style="text-align: center; padding: 10px 0; color: #666">
        <p>确定要提交本次审批吗？</p>
        <p style="font-size: 13px; color: #999; margin-top: 6px">提交后将通知相关审批人</p>
      </div>
      <template #footer>
        <ElButton @click="visible = false">取消</ElButton>
        <ElButton type="primary" @click="visible = false">确认提交</ElButton>
      </template>
    </Dialog>
  </div>
</template>
