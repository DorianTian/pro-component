<script setup lang="ts">
import { Tooltip } from '@pro/tooltip'
import { ElButton } from 'element-plus'
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 600px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      12 种弹出方向
    </span>
    <div style="display: flex; flex-direction: column; gap: 12px; align-items: center">
      <!-- Top row -->
      <div style="display: flex; gap: 8px">
        <Tooltip content="top-start" placement="top-start">
          <ElButton>上左</ElButton>
        </Tooltip>
        <Tooltip content="top" placement="top">
          <ElButton>上方</ElButton>
        </Tooltip>
        <Tooltip content="top-end" placement="top-end">
          <ElButton>上右</ElButton>
        </Tooltip>
      </div>
      <!-- Middle rows -->
      <div style="display: flex; gap: 200px">
        <div style="display: flex; flex-direction: column; gap: 8px">
          <Tooltip content="left-start" placement="left-start">
            <ElButton>左上</ElButton>
          </Tooltip>
          <Tooltip content="left" placement="left">
            <ElButton>左侧</ElButton>
          </Tooltip>
          <Tooltip content="left-end" placement="left-end">
            <ElButton>左下</ElButton>
          </Tooltip>
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px">
          <Tooltip content="right-start" placement="right-start">
            <ElButton>右上</ElButton>
          </Tooltip>
          <Tooltip content="right" placement="right">
            <ElButton>右侧</ElButton>
          </Tooltip>
          <Tooltip content="right-end" placement="right-end">
            <ElButton>右下</ElButton>
          </Tooltip>
        </div>
      </div>
      <!-- Bottom row -->
      <div style="display: flex; gap: 8px">
        <Tooltip content="bottom-start" placement="bottom-start">
          <ElButton>下左</ElButton>
        </Tooltip>
        <Tooltip content="bottom" placement="bottom">
          <ElButton>下方</ElButton>
        </Tooltip>
        <Tooltip content="bottom-end" placement="bottom-end">
          <ElButton>下右</ElButton>
        </Tooltip>
      </div>
    </div>
  </div>
</template>
