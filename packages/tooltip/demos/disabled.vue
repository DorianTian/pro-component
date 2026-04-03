<script setup lang="ts">
import { ref } from 'vue'
import { Tooltip } from '@pro/tooltip'
import { ElButton, ElSwitch } from 'element-plus'

const isDisabled = ref(false)
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 480px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      禁用 Tooltip
    </span>
    <div style="display: flex; gap: 16px; align-items: center">
      <Tooltip content="这段提示可以被禁用" :disabled="isDisabled">
        <ElButton>悬停查看</ElButton>
      </Tooltip>
      <div style="display: flex; align-items: center; gap: 8px">
        <ElSwitch v-model="isDisabled" />
        <span style="font-size: 13px; color: #525252">
          {{ isDisabled ? '已禁用' : '已启用' }}
        </span>
      </div>
    </div>
  </div>
</template>
