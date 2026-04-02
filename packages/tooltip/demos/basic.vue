<script setup lang="ts">
import { Tooltip } from '@pro/tooltip'
import { ElButton } from 'element-plus'
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 480px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      不同方向
    </span>
    <div style="display: flex; gap: 8px; flex-wrap: wrap">
      <Tooltip content="上方提示" placement="top">
        <ElButton>Top</ElButton>
      </Tooltip>
      <Tooltip content="下方提示" placement="bottom">
        <ElButton>Bottom</ElButton>
      </Tooltip>
      <Tooltip content="左侧提示" placement="left">
        <ElButton>Left</ElButton>
      </Tooltip>
      <Tooltip content="右侧提示" placement="right">
        <ElButton>Right</ElButton>
      </Tooltip>
    </div>

    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      多行内容
    </span>
    <Tooltip placement="top">
      <template #content>
        <div>第一行提示信息</div>
        <div>第二行提示信息</div>
      </template>
      <ElButton>多行提示</ElButton>
    </Tooltip>
  </div>
</template>
