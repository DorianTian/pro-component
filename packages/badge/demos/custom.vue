<script setup lang="ts">
import { Badge } from '@pro/badge'
import { ElButton } from 'element-plus'
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 480px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      自定义徽章内容
    </span>
    <div style="display: flex; gap: 24px; align-items: center">
      <Badge value="新">
        <ElButton>活动</ElButton>
      </Badge>
      <Badge value="热">
        <ElButton>话题</ElButton>
      </Badge>
      <Badge value="VIP">
        <ElButton>会员</ElButton>
      </Badge>
    </div>
  </div>
</template>
