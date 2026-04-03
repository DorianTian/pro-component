<script setup lang="ts">
import { Popover } from '@pro/popover'
import { ElButton } from 'element-plus'
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 480px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      基础弹出框
    </span>
    <div style="display: flex; gap: 12px">
      <Popover trigger="hover" content="鼠标悬停显示的内容" width="200">
        <template #reference>
          <ElButton>hover 触发</ElButton>
        </template>
      </Popover>
      <Popover trigger="click" title="提示" content="点击后显示的内容" width="200">
        <template #reference>
          <ElButton>click 触发</ElButton>
        </template>
      </Popover>
    </div>
  </div>
</template>
