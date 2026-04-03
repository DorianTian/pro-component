<script setup lang="ts">
import { ref } from 'vue'
import { Popover } from '@pro/popover'
import { ElButton } from 'element-plus'

const visible = ref(false)

function handleConfirm() {
  visible.value = false
}
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 480px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      嵌套操作确认，适合轻量级的二次确认场景
    </span>
    <Popover v-model:visible="visible" trigger="click" width="220">
      <template #reference>
        <ElButton type="danger">删除记录</ElButton>
      </template>
      <p style="margin: 0 0 12px; font-size: 14px; color: #525252">确定要删除这条记录吗？</p>
      <div style="display: flex; justify-content: flex-end; gap: 8px">
        <ElButton size="small" @click="visible = false">取消</ElButton>
        <ElButton size="small" type="primary" @click="handleConfirm">确定</ElButton>
      </div>
    </Popover>
  </div>
</template>
