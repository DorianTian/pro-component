<script setup lang="ts">
import { ref } from 'vue'
import { Badge } from '@pro/badge'
import { ElButton } from 'element-plus'

const count = ref(5)
const hidden = ref(false)
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 24px; max-width: 480px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      数字徽章
    </span>
    <div style="display: flex; gap: 24px; align-items: center">
      <Badge :value="count">
        <ElButton>消息</ElButton>
      </Badge>
      <Badge :value="200" :max="99">
        <ElButton>评论</ElButton>
      </Badge>
    </div>

    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      小圆点
    </span>
    <div style="display: flex; gap: 24px; align-items: center">
      <Badge is-dot>
        <ElButton>通知</ElButton>
      </Badge>
      <Badge is-dot type="warning">
        <ElButton>待处理</ElButton>
      </Badge>
    </div>

    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      动态控制
    </span>
    <div style="display: flex; gap: 12px; align-items: center">
      <Badge :value="count" :hidden="hidden">
        <ElButton>邮件</ElButton>
      </Badge>
      <ElButton size="small" @click="count++">+1</ElButton>
      <ElButton size="small" @click="count = Math.max(0, count - 1)">-1</ElButton>
      <ElButton size="small" @click="hidden = !hidden">
        {{ hidden ? '显示' : '隐藏' }}
      </ElButton>
    </div>
  </div>
</template>
