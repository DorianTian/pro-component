<script setup lang="ts">
import { ref } from 'vue'
import { Badge } from '@pro/badge'
import { ElButton, ElSwitch } from 'element-plus'

const isHidden = ref(false)
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 480px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      通过 hidden 属性条件控制徽章显隐
    </span>
    <div style="display: flex; gap: 24px; align-items: center">
      <Badge :value="6" :hidden="isHidden">
        <ElButton>消息</ElButton>
      </Badge>
      <div style="display: flex; align-items: center; gap: 8px">
        <ElSwitch v-model="isHidden" />
        <span style="font-size: 13px; color: #525252">
          {{ isHidden ? '已隐藏' : '显示中' }}
        </span>
      </div>
    </div>
  </div>
</template>
