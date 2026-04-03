<script setup lang="ts">
import { ProTag } from '@pro/tag'
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 480px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      不同尺寸标签
    </span>
    <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center">
      <ProTag size="large" status="success">大号标签</ProTag>
      <ProTag size="default" status="success">默认标签</ProTag>
      <ProTag size="small" status="success">小号标签</ProTag>
    </div>
  </div>
</template>
