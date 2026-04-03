<script setup lang="ts">
import { Badge } from '@pro/badge'
import { ElButton } from 'element-plus'
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 480px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      基础徽章
    </span>
    <div style="display: flex; gap: 24px; align-items: center">
      <Badge :value="5">
        <ElButton>消息</ElButton>
      </Badge>
      <Badge :value="12">
        <ElButton>评论</ElButton>
      </Badge>
      <Badge :value="3">
        <ElButton>待办</ElButton>
      </Badge>
    </div>
  </div>
</template>
