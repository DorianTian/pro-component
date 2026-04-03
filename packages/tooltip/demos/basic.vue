<script setup lang="ts">
import { Tooltip } from '@pro/tooltip'
import { ElButton } from 'element-plus'
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 480px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      基础文字提示，默认延迟 300ms 显示
    </span>
    <div style="display: flex; gap: 12px">
      <Tooltip content="这是一段提示文字">
        <ElButton>悬停查看</ElButton>
      </Tooltip>
    </div>
  </div>
</template>
