<script setup lang="ts">
import { Tooltip } from '@pro/tooltip'
import { ElButton } from 'element-plus'
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 480px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      不同触发方式
    </span>
    <div style="display: flex; gap: 12px; flex-wrap: wrap">
      <Tooltip content="悬停触发" trigger="hover">
        <ElButton>hover</ElButton>
      </Tooltip>
      <Tooltip content="点击触发" trigger="click">
        <ElButton>click</ElButton>
      </Tooltip>
      <Tooltip content="聚焦触发" trigger="focus">
        <ElButton>focus</ElButton>
      </Tooltip>
      <Tooltip content="右键触发" trigger="contextmenu">
        <ElButton>contextmenu</ElButton>
      </Tooltip>
    </div>
  </div>
</template>
