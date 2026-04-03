<script setup lang="ts">
import { ProTag } from '@pro/tag'
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 480px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      有边框（默认）
    </span>
    <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center">
      <ProTag :bordered="true" status="success">运行中</ProTag>
      <ProTag :bordered="true" status="warning">待处理</ProTag>
      <ProTag :bordered="true" status="error">已关闭</ProTag>
    </div>

    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      无边框
    </span>
    <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center">
      <ProTag :bordered="false" status="success">运行中</ProTag>
      <ProTag :bordered="false" status="warning">待处理</ProTag>
      <ProTag :bordered="false" status="error">已关闭</ProTag>
    </div>
  </div>
</template>
