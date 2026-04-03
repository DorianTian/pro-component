<script setup lang="ts">
import { ProTag } from '@pro/tag'
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 560px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      所有预设状态：带状态圆点、processing 有呼吸动画
    </span>
    <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center">
      <ProTag status="success">运行正常</ProTag>
      <ProTag status="warning">待审核</ProTag>
      <ProTag status="error">已停用</ProTag>
      <ProTag status="info">草稿</ProTag>
      <ProTag status="processing">同步中</ProTag>
      <ProTag status="default">未知状态</ProTag>
    </div>
  </div>
</template>
