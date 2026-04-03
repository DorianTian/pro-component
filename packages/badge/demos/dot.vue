<script setup lang="ts">
import { Badge } from '@pro/badge'
import { ElButton } from 'element-plus'
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 480px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      小圆点模式，用于提示有新内容
    </span>
    <div style="display: flex; gap: 24px; align-items: center">
      <Badge is-dot>
        <ElButton>通知</ElButton>
      </Badge>
      <Badge is-dot>
        <span style="font-size: 20px">📧</span>
      </Badge>
      <Badge is-dot>
        <span style="font-size: 20px">🔔</span>
      </Badge>
    </div>
  </div>
</template>
