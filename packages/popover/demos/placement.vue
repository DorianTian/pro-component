<script setup lang="ts">
import { Popover } from '@pro/popover'
import { ElButton } from 'element-plus'
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 600px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      不同弹出方向
    </span>
    <div style="display: flex; gap: 8px; flex-wrap: wrap">
      <Popover
        v-for="p in ['top', 'top-start', 'top-end', 'bottom', 'left', 'right']"
        :key="p"
        :placement="p"
        trigger="hover"
        :content="`弹出方向：${p}`"
        width="160"
      >
        <template #reference>
          <ElButton>{{ p }}</ElButton>
        </template>
      </Popover>
    </div>
  </div>
</template>
