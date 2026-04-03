<script setup lang="ts">
import { Tooltip } from '@pro/tooltip'
import { ElButton } from 'element-plus'
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 480px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      自定义显示延迟
    </span>
    <div style="display: flex; gap: 12px; flex-wrap: wrap">
      <Tooltip content="无延迟" :show-after="0">
        <ElButton>0ms</ElButton>
      </Tooltip>
      <Tooltip content="默认延迟 300ms">
        <ElButton>300ms（默认）</ElButton>
      </Tooltip>
      <Tooltip content="较长延迟" :show-after="800">
        <ElButton>800ms</ElButton>
      </Tooltip>
      <Tooltip content="隐藏也有延迟" :show-after="0" :hide-after="2000">
        <ElButton>显示 2 秒</ElButton>
      </Tooltip>
    </div>
  </div>
</template>
