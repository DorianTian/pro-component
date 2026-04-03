<script setup lang="ts">
import { Popover } from '@pro/popover'
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
      <Popover trigger="hover" content="悬停触发" width="160">
        <template #reference>
          <ElButton>hover</ElButton>
        </template>
      </Popover>
      <Popover trigger="click" content="点击触发" width="160">
        <template #reference>
          <ElButton>click</ElButton>
        </template>
      </Popover>
      <Popover trigger="focus" content="聚焦触发" width="160">
        <template #reference>
          <ElButton>focus</ElButton>
        </template>
      </Popover>
      <Popover trigger="contextmenu" content="右键触发" width="160">
        <template #reference>
          <ElButton>contextmenu</ElButton>
        </template>
      </Popover>
    </div>
  </div>
</template>
