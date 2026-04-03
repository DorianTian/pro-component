<script setup lang="ts">
import { ref } from 'vue'
import { Popover } from '@pro/popover'
import { ElButton } from 'element-plus'

const triggerRef = ref<HTMLElement>()
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 480px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      虚拟触发：Popover 绑定到任意元素上
    </span>
    <ElButton ref="triggerRef">我是虚拟触发元素</ElButton>
    <Popover
      :virtual-ref="triggerRef"
      virtual-triggering
      trigger="click"
      content="通过 virtual-ref 绑定到上方按钮"
      width="240"
    />
  </div>
</template>
