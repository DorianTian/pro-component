<script setup lang="ts">
import { Badge } from '@pro/badge'
import { ElButton } from 'element-plus'
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 480px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      超出最大值时显示 max+
    </span>
    <div style="display: flex; gap: 24px; align-items: center">
      <Badge :value="200" :max="99">
        <ElButton>消息</ElButton>
      </Badge>
      <Badge :value="50" :max="10">
        <ElButton>通知</ElButton>
      </Badge>
      <Badge :value="1000" :max="999">
        <ElButton>邮件</ElButton>
      </Badge>
    </div>
  </div>
</template>
