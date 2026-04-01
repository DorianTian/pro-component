<script setup lang="ts">
import { ProTag } from '@pro/tag'
</script>

<template>
  <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center">
    <ProTag status="success">正常运行</ProTag>
    <ProTag status="warning">待审核</ProTag>
    <ProTag status="error">已停用</ProTag>
    <ProTag status="processing">同步中</ProTag>
    <ProTag status="info">草稿</ProTag>
    <ProTag status="default">未知</ProTag>
  </div>
</template>
