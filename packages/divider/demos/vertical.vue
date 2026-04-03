<script setup lang="ts">
import { Divider } from '@pro/divider'
</script>

<template>
  <div style="max-width: 480px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      垂直分割线，常用于行内元素之间
    </span>
    <div style="display: flex; align-items: center; font-size: 14px; color: #525252">
      <span>首页</span>
      <Divider direction="vertical" />
      <span>文档</span>
      <Divider direction="vertical" />
      <span>指南</span>
      <Divider direction="vertical" />
      <span>组件</span>
    </div>
  </div>
</template>
