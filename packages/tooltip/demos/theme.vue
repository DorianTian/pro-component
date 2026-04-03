<script setup lang="ts">
import { Tooltip } from '@pro/tooltip'
import { ElButton } from 'element-plus'
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 480px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      深色和浅色主题
    </span>
    <div style="display: flex; gap: 12px">
      <Tooltip content="深色主题提示" effect="dark">
        <ElButton>Dark</ElButton>
      </Tooltip>
      <Tooltip content="浅色主题提示" effect="light">
        <ElButton>Light</ElButton>
      </Tooltip>
    </div>
  </div>
</template>
